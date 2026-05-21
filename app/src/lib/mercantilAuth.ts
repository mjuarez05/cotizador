let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;

export async function getMercantilToken() {
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const res = await fetch("https://api.mercantilandina.com.ar/credenciales/v2/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Ocp-Apim-Subscription-Key": process.env.API_SUB_KEY!,
    },
    body: new URLSearchParams({
      client_id: process.env.API_CLIENT_ID!,
      username: process.env.API_USER!,
      password: process.env.API_PASSWORD!,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Token request failed: ${res.status} - ${errorBody}`);
  }

  const data = await res.json();

  if (!data.access_token) {
    throw new Error(`No access_token in response: ${JSON.stringify(data)}`);
  }

  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return cachedToken;
}