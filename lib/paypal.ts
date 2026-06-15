// PayPal REST (Orders v2) helpers for server-side order creation and capture.
//
// Required env vars (see DEPLOYMENT.md / .env.example):
//   PAYPAL_CLIENT_ID            REST app client id
//   PAYPAL_SECRET               REST app secret
//   PAYPAL_ENV                  "live" or "sandbox" (default "sandbox")
//   NEXT_PUBLIC_PAYPAL_CLIENT_ID  same client id, exposed to the browser SDK
//
// When the secret is not configured, isPaypalConfigured() is false and the
// public checkout hides the card/PayPal option, leaving check payment available.

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID ?? "";
const SECRET = process.env.PAYPAL_SECRET ?? "";
const BASE =
  (process.env.PAYPAL_ENV ?? "sandbox").toLowerCase() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export function isPaypalConfigured(): boolean {
  return Boolean(CLIENT_ID && SECRET);
}

async function accessToken(): Promise<string> {
  const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status})`);
  const data = await res.json();
  return data.access_token as string;
}

const toAmount = (cents: number) => (cents / 100).toFixed(2);

/** Create a CAPTURE order for the given total (cents). Returns the order id. */
export async function createOrder(amountCents: number, description: string): Promise<string> {
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "USD", value: toAmount(amountCents) },
          description: description.slice(0, 127),
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`PayPal order create failed (${res.status})`);
  const data = await res.json();
  return data.id as string;
}

export type CaptureResult = { completed: boolean; amountCents: number | null };

/** Capture a previously created order. Returns whether it completed + the captured amount. */
export async function captureOrder(orderId: string): Promise<CaptureResult> {
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`PayPal capture failed (${res.status})`);
  const data = await res.json();
  const capture = data?.purchase_units?.[0]?.payments?.captures?.[0];
  const value = capture?.amount?.value;
  return {
    completed: data?.status === "COMPLETED",
    amountCents: value != null ? Math.round(parseFloat(value) * 100) : null,
  };
}
