import { hitsterStore, json } from "../lib/store.mts";

const KEY = "played";
const MAX_IDS = 5000;
const ids = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && /^[A-Za-z0-9]{1,40}$/.test(x)) : [];

export default async (req: Request) => {
  const store = hitsterStore();
  const current: string[] = ids(await store.get(KEY, { type: "json" }));

  if (req.method === "GET") return json({ played: current });
  if (req.method !== "POST") return json({ error: "Metodo non supportato" }, 405);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Richiesta non valida" }, 400); }

  const set = new Set(body?.reset ? [] : current);
  for (const id of ids(body?.add)) set.add(id);
  for (const id of ids(body?.remove)) set.delete(id);
  const played = [...set].slice(-MAX_IDS);

  const changed = played.length !== current.length || played.some((id, i) => id !== current[i]);
  if (changed) await store.setJSON(KEY, played);
  return json({ played });
};

export const config = { path: "/api/played" };
