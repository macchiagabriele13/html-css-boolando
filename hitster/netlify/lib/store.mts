import { getStore, getDeployStore } from "@netlify/blobs";

// Production uses the global store; previews and branch deploys get their own copy.
export function hitsterStore() {
  const opts = { name: "hitster", consistency: "strong" as const };
  return Netlify.context?.deploy?.context === "production" ? getStore(opts) : getDeployStore(opts);
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
