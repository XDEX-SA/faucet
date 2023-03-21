export type FaucetRequest = {
  to: string;
  asset: string;
};

export type FaucetResponse = { txid: string };
export type FetchAssetsResponse = { assets: Record<string, string> };

const BACKEND_URL = "https://api.faucet.vulpem.com"

//const BACKEND_URL = "http://localhost:8000"


export async function requestAsset(
  req: FaucetRequest
): Promise<FaucetResponse> {
  const res = await fetch(`${BACKEND_URL}/api/send`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

export async function fetchAssets(): Promise<FetchAssetsResponse> {
  const res = await fetch(`${BACKEND_URL}/api/assets`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}
