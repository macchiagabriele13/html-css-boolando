import { hitsterStore, json } from "../lib/store.mts";

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const MAX_STATE = 200_000;
const validCode = (c: unknown): c is string => typeof c === "string" && /^[A-Z]{4}$/.test(c);
const key = (code: string) => `room/${code}`;

export default async (req: Request) => {
  const store = hitsterStore();

  if (req.method === "GET") {
    const code = new URL(req.url).searchParams.get("code")?.toUpperCase();
    if (!validCode(code)) return json({ error: "Codice non valido" }, 400);
    const state = await store.get(key(code), { type: "json" });
    return state ? json({ state }) : json({ error: "Partita non trovata" }, 404);
  }

  if (req.method !== "POST") return json({ error: "Metodo non supportato" }, 405);

  const raw = await req.text();
  if (raw.length > MAX_STATE) return json({ error: "Partita troppo grande" }, 413);
  let body: any;
  try { body = JSON.parse(raw); } catch { return json({ error: "Richiesta non valida" }, 400); }
  if (!body || typeof body.state !== "object" || body.state === null) return json({ error: "Stato mancante" }, 400);

  if (body.op === "create") {
    for (let tries = 0; tries < 20; tries++) {
      let code = "";
      for (let i = 0; i < 4; i++) code += LETTERS[Math.floor(Math.random() * LETTERS.length)];
      if (await store.get(key(code))) continue;
      const state = { ...body.state, code, v: 1, updatedAt: Date.now() };
      await store.setJSON(key(code), state);
      return json({ state });
    }
    return json({ error: "Nessun codice libero, riprova" }, 503);
  }

  if (body.op === "update") {
    if (!validCode(body.code)) return json({ error: "Codice non valido" }, 400);
    const current: any = await store.get(key(body.code), { type: "json" });
    if (!current) return json({ error: "Partita non trovata" }, 404);
    // Someone else moved first: hand back the latest state so the client catches up.
    if (body.v !== current.v) return json({ state: current }, 409);
    const state = { ...body.state, code: body.code, v: current.v + 1, updatedAt: Date.now() };
    await store.setJSON(key(body.code), state);
    return json({ state });
  }

  return json({ error: "Operazione sconosciuta" }, 400);
};

export const config = { path: "/api/room" };
