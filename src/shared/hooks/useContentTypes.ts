import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@shared/lib/firebase";

export type ContentType = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
};

export function useContentTypes() {
  const [types, setTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "contentTypes"), orderBy("order")),
      (snap) => {
        setTypes(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ContentType, "id">) })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const activeTypes = types.filter((t) => t.isActive);
  return { types, activeTypes, loading };
}
