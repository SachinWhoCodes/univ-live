import { uploadToMediaKit } from "@/lib/mediakit";

export function insertAtCursor(
  value: string,
  insert: string,
  selectionStart: number | null | undefined,
  selectionEnd: number | null | undefined
) {
  const start = typeof selectionStart === "number" ? selectionStart : value.length;
  const end = typeof selectionEnd === "number" ? selectionEnd : value.length;
  return value.slice(0, start) + insert + value.slice(end);
}

export async function tryHandleImagePaste(
  e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  opts: {
    folder?: string;
    currentValue: string;
    setValue: (v: string) => void;
    onUploading?: (v: boolean) => void;
    insertTemplate?: (url: string) => string;
  }
) {
  const items = e.clipboardData?.items;
  if (!items || items.length === 0) return false;

  const imgItem = Array.from(items).find((it) => it.type.startsWith("image/"));
  if (!imgItem) return false;

  e.preventDefault();

  const blob = imgItem.getAsFile();
  if (!blob) return false;

  opts.onUploading?.(true);
  try {
    const up = await uploadToMediaKit(blob, {
      folder: opts.folder || "/question-bank",
      fileName: `pasted_${Date.now()}.png`,
    });
    const tpl =
      opts.insertTemplate ||
      ((url) => `\n<img src="${url}" alt="image" />\n`);

    const el = e.currentTarget;
    const next = insertAtCursor(
      opts.currentValue,
      tpl(up.url),
      el.selectionStart,
      el.selectionEnd
    );
    opts.setValue(next);
    return true;
  } finally {
    opts.onUploading?.(false);
  }
}

