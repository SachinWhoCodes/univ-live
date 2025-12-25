import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Send,
  Paperclip,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmptyState from "@/components/educator/EmptyState";
import { toast } from "sonner";

import { onAuthStateChanged } from "firebase/auth";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  setDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import { auth, db } from "@/lib/firebase";

type TicketStatus = "open" | "pending" | "resolved";

type Ticket = {
  id: string;
  subject: string;
  status: TicketStatus;
  createdAtTs?: Timestamp | null;
  updatedAtTs?: Timestamp | null;
  lastMessagePreview?: string;
  unreadForEducator?: number; // optional (if admin maintains), we reset it when educator opens
};

type Attachment = {
  name: string;
  url: string;
  contentType?: string;
  size?: number;
};

type ChatMessage = {
  id: string;
  text: string;
  sender: "educator" | "admin";
  createdAtTs?: Timestamp | null;
  attachments?: Attachment[];
};

function fmtTime(ts?: Timestamp | null) {
  if (!ts) return "";
  try {
    return ts.toDate().toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function statusBadge(status: TicketStatus) {
  if (status === "resolved") {
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  }
  if (status === "pending") {
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  }
  return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
}

function statusIcon(status: TicketStatus) {
  if (status === "resolved") return CheckCircle2;
  if (status === "pending") return AlertCircle;
  return MessageSquare;
}

async function uploadAttachment(
  uid: string,
  ticketId: string,
  messageId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<Attachment> {
  const storage = getStorage();
  const path = `supportTickets/${uid}/${ticketId}/${messageId}/${Date.now()}-${file.name}`;
  const ref = storageRef(storage, path);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(ref, file, {
      contentType: file.type || "application/octet-stream",
    });

    task.on(
      "state_changed",
      (snap) => {
        const pct = snap.totalBytes ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100) : 0;
        onProgress?.(pct);
      },
      (err) => reject(err),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({
          name: file.name,
          url,
          contentType: file.type,
          size: file.size,
        });
      }
    );
  });
}

export default function Messages() {
  const [uid, setUid] = useState<string | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgText, setMsgText] = useState("");

  const [search, setSearch] = useState("");
  const [isNewOpen, setIsNewOpen] = useState(false);

  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [sending, setSending] = useState(false);
  const [uploadPct, setUploadPct] = useState<number>(0);

  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, []);

  // Tickets list (realtime)
  useEffect(() => {
    if (!uid) {
      setTickets([]);
      setSelectedTicketId(null);
      setLoadingTickets(false);
      return;
    }

    setLoadingTickets(true);

    const ref = collection(db, "educators", uid, "supportTickets");
    const q = query(ref, orderBy("updatedAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Ticket[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            subject: String(data?.subject || "Support Ticket"),
            status: (data?.status || "open") as TicketStatus,
            createdAtTs: (data?.createdAt as Timestamp) || null,
            updatedAtTs: (data?.updatedAt as Timestamp) || null,
            lastMessagePreview: String(data?.lastMessagePreview || ""),
            unreadForEducator: Number(data?.unreadForEducator || 0),
          };
        });

        setTickets(list);

        if (!selectedTicketId && list.length) {
          setSelectedTicketId(list[0].id);
        }

        setLoadingTickets(false);
      },
      () => {
        toast.error("Failed to load tickets");
        setTickets([]);
        setLoadingTickets(false);
      }
    );

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // Messages list (realtime) for selected ticket
  useEffect(() => {
    if (!uid || !selectedTicketId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    setLoadingMessages(true);

    const ref = collection(db, "educators", uid, "supportTickets", selectedTicketId, "messages");
    const q = query(ref, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: ChatMessage[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            text: String(data?.text || ""),
            sender: (data?.sender || "educator") as "educator" | "admin",
            createdAtTs: (data?.createdAt as Timestamp) || null,
            attachments: Array.isArray(data?.attachments) ? (data.attachments as Attachment[]) : [],
          };
        });

        setMessages(list);
        setLoadingMessages(false);

        // auto scroll
        requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
      },
      () => {
        toast.error("Failed to load messages");
        setMessages([]);
        setLoadingMessages(false);
      }
    );

    return () => unsub();
  }, [uid, selectedTicketId]);

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter((t) => {
      return (
        t.subject.toLowerCase().includes(q) ||
        (t.lastMessagePreview || "").toLowerCase().includes(q)
      );
    });
  }, [tickets, search]);

  const selectedTicket = useMemo(() => {
    if (!selectedTicketId) return null;
    return tickets.find((t) => t.id === selectedTicketId) || null;
  }, [tickets, selectedTicketId]);

  async function openTicket(ticketId: string) {
    if (!uid) return;
    setSelectedTicketId(ticketId);

    // mark as read (backend)
    try {
      await updateDoc(doc(db, "educators", uid, "supportTickets", ticketId), {
        educatorLastReadAt: serverTimestamp(),
        unreadForEducator: 0, // safe even if field doesn't exist yet
      });
    } catch {
      // non-blocking
    }
  }

  async function createTicket() {
    if (!uid) return;

    const subject = newSubject.trim();
    const firstMsg = newMessage.trim();

    if (!subject) return toast.error("Please enter a subject");
    if (!firstMsg) return toast.error("Please enter your message");

    try {
      setSending(true);

      const ticketsCol = collection(db, "educators", uid, "supportTickets");
      const ticketDocRef = doc(ticketsCol); // pre-generate id

      const msgCol = collection(db, "educators", uid, "supportTickets", ticketDocRef.id, "messages");
      const firstMsgRef = doc(msgCol);

      const batch = writeBatch(db);

      batch.set(ticketDocRef, {
        subject,
        status: "open",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessagePreview: firstMsg.slice(0, 140),
        unreadForEducator: 0,
        educatorLastReadAt: serverTimestamp(),
      });

      batch.set(firstMsgRef, {
        text: firstMsg,
        sender: "educator",
        createdAt: serverTimestamp(),
        attachments: [],
      });

      await batch.commit();

      setIsNewOpen(false);
      setNewSubject("");
      setNewMessage("");
      setSelectedTicketId(ticketDocRef.id);

      toast.success("Ticket created");
    } catch (e) {
      console.error(e);
      toast.error("Could not create ticket");
    } finally {
      setSending(false);
    }
  }

  async function updateTicketStatus(next: TicketStatus) {
    if (!uid || !selectedTicketId) return;

    try {
      await updateDoc(doc(db, "educators", uid, "supportTickets", selectedTicketId), {
        status: next,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Ticket marked ${next}`);
    } catch {
      toast.error("Could not update status");
    }
  }

  async function sendMessage() {
    if (!uid || !selectedTicketId) return;

    const text = msgText.trim();
    if (!text && !attachedFile) return;

    try {
      setSending(true);
      setUploadPct(0);

      const msgCol = collection(db, "educators", uid, "supportTickets", selectedTicketId, "messages");
      const msgRef = doc(msgCol); // create message id before upload (for storage path)

      let attachments: Attachment[] = [];

      if (attachedFile) {
        const att = await uploadAttachment(uid, selectedTicketId, msgRef.id, attachedFile, setUploadPct);
        attachments = [att];
      }

      const batch = writeBatch(db);

      batch.set(msgRef, {
        text: text || "",
        sender: "educator",
        createdAt: serverTimestamp(),
        attachments,
      });

      batch.update(doc(db, "educators", uid, "supportTickets", selectedTicketId), {
        updatedAt: serverTimestamp(),
        lastMessagePreview: (text || (attachedFile ? `Attachment: ${attachedFile.name}` : "")).slice(0, 140),
        status: "open",
        educatorLastReadAt: serverTimestamp(),
        unreadForEducator: 0,
      });

      await batch.commit();

      setMsgText("");
      setAttachedFile(null);
      setUploadPct(0);
    } catch (e) {
      console.error(e);
      toast.error("Could not send message");
    } finally {
      setSending(false);
    }
  }

  if (!uid && !loadingTickets) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Messages / Support</h1>
          <p className="text-muted-foreground text-sm">
            Chat with support and manage your tickets
          </p>
        </div>
        <EmptyState
          icon={MessageSquare}
          title="Please login as Educator"
          description="You must be logged in to access support messages."
          actionLabel="Go to Login"
          onAction={() => (window.location.href = "/login?role=educator")}
        />
      </div>
    );
  }

  const SelectedStatusIcon = selectedTicket ? statusIcon(selectedTicket.status) : MessageSquare;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Messages / Support</h1>
          <p className="text-muted-foreground text-sm">
            Chat with support and manage your tickets
          </p>
        </div>

        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 mt-2">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="E.g. Payment issue / Website generation / Test series"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Describe your issue..."
                  className="min-h-[120px] rounded-xl"
                />
              </div>

              <Button
                className="w-full gradient-bg text-white rounded-xl"
                onClick={createTicket}
                disabled={sending}
              >
                {sending ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </span>
                ) : (
                  "Create Ticket"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <Card className="lg:col-span-1 card-soft border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Tickets
            </CardTitle>

            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets..."
                className="pl-9 rounded-xl"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-2 max-h-[65vh] overflow-auto pr-1">
            {loadingTickets ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading tickets...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-sm text-muted-foreground py-10 text-center">
                No tickets found.
              </div>
            ) : (
              filteredTickets.map((t, idx) => (
                <motion.button
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => openTicket(t.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all",
                    selectedTicketId === t.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {t.lastMessagePreview || "No messages yet"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {t.unreadForEducator ? (
                        <Badge className="rounded-full">{t.unreadForEducator}</Badge>
                      ) : null}
                      <Badge variant="secondary" className={statusBadge(t.status)}>
                        {t.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{fmtTime(t.updatedAtTs || t.createdAtTs || null)}</span>
                  </div>
                </motion.button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chat Panel */}
        <Card className="lg:col-span-2 card-soft border-0">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-base">
                  {selectedTicket ? selectedTicket.subject : "Select a ticket"}
                </CardTitle>
                {selectedTicket && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Updated: {fmtTime(selectedTicket.updatedAtTs || null)}
                  </p>
                )}
              </div>

              {selectedTicket && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={statusBadge(selectedTicket.status)}>
                    <SelectedStatusIcon className="h-3 w-3 mr-1" />
                    {selectedTicket.status}
                  </Badge>

                  {/* Status control */}
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(v) => updateTicketStatus(v as TicketStatus)}
                  >
                    <SelectTrigger className="w-[150px] rounded-xl">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">open</SelectItem>
                      <SelectItem value="pending">pending</SelectItem>
                      <SelectItem value="resolved">resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex flex-col h-[65vh]">
            {/* Messages */}
            <div className="flex-1 overflow-auto pr-1 space-y-3">
              {!selectedTicket ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  Select a ticket to view messages.
                </div>
              ) : loadingMessages ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  No messages yet.
                </div>
              ) : (
                messages.map((m) => {
                  const mine = m.sender === "educator";
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-3 text-sm border",
                          mine
                            ? "bg-primary text-primary-foreground border-primary/20"
                            : "bg-card border-border"
                        )}
                      >
                        {m.text ? <p className="whitespace-pre-wrap">{m.text}</p> : null}

                        {m.attachments?.length ? (
                          <div className={cn("mt-3 space-y-2", mine ? "text-primary-foreground" : "text-foreground")}>
                            {m.attachments.map((a, idx) => (
                              <a
                                key={`${m.id}-att-${idx}`}
                                href={a.url}
                                target="_blank"
                                rel="noreferrer"
                                className={cn(
                                  "flex items-center gap-2 rounded-xl px-3 py-2 border text-xs",
                                  mine
                                    ? "border-white/20 bg-white/10 hover:bg-white/15"
                                    : "border-border bg-muted/30 hover:bg-muted/50"
                                )}
                              >
                                <Paperclip className="h-4 w-4" />
                                <span className="truncate">{a.name}</span>
                              </a>
                            ))}
                          </div>
                        ) : null}

                        <p
                          className={cn(
                            "text-[11px] mt-2 opacity-80",
                            mine ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}
                        >
                          {fmtTime(m.createdAtTs || null)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <div className="mt-3 pt-3 border-t border-border">
              {/* Attachment preview */}
              {attachedFile && (
                <div className="flex items-center justify-between gap-2 p-2 mb-2 rounded-xl border border-border bg-muted/30">
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{attachedFile.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(attachedFile.size / 1024).toFixed(1)} KB
                      {uploadPct > 0 && sending ? ` • Uploading ${uploadPct}%` : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                    onClick={() => setAttachedFile(null)}
                    disabled={sending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setAttachedFile(f);
                }}
              />

              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedTicketId || sending}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                <div className="flex-1">
                  <Textarea
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder={selectedTicketId ? "Type your message..." : "Select a ticket first..."}
                    className="min-h-[44px] max-h-32 rounded-2xl"
                    disabled={!selectedTicketId || sending}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>

                <Button
                  className="gradient-bg text-white rounded-xl"
                  onClick={sendMessage}
                  disabled={!selectedTicketId || sending || (!msgText.trim() && !attachedFile)}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground mt-2">
                Tip: Press Enter to send, Shift+Enter for new line.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

