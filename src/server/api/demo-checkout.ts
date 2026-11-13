import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { parseCheckout } from "@/server/checkout";
import { submitCheckout } from "@/server/database";
export async function POST(request: NextRequest) {
  const protocol = process.env.HOSTED ? "https:" : request.nextUrl.protocol;
  const expectedOrigin = `${protocol}//${request.headers.get("host")}`;
  if (request.headers.get("origin") !== expectedOrigin)
    return NextResponse.json(
      { message: "Use checkout on this website." },
      { status: 403 },
    );
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return NextResponse.json({ message: "Expected JSON" }, { status: 415 });
  let input;
  try {
    // Bound bytes while streaming: Content-Length is not trustworthy.
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Empty request");
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 12000) {
        await reader.cancel();
        throw new Error("Request too large");
      }
      chunks.push(value);
    }
    input = parseCheckout(JSON.parse(Buffer.concat(chunks).toString("utf8")));
  } catch {
    return NextResponse.json(
      {
        message:
          "Review your cart: choose 1–30 cards, with quantities from 1 to 10.",
      },
      { status: 400 },
    );
  }
  try {
    const secret =
      process.env.CHECKOUT_RATE_SECRET ||
      (!process.env.HOSTED ? "local-development-only" : "");
    if (!secret) throw new Error("Missing checkout rate secret");
    // Cloudflare sets cf-connecting-ip. Local use shares one bucket.
    const address = process.env.HOSTED
      ? request.headers.get("cf-connecting-ip") || "unknown"
      : "local";
    const window = Math.floor(Date.now() / 900000);
    const bucket = createHmac("sha256", secret)
      .update(`${address}:${window}`)
      .digest("hex");
    const result = await submitCheckout(input, bucket);
    const status = {
      completed: 200,
      requote: 409,
      invalid: 422,
      conflict: 409,
      failed: 402,
      limited: 429,
    }[result.kind];
    return NextResponse.json(result, {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(status === 429 ? { "Retry-After": "900" } : {}),
      },
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "Checkout is temporarily unavailable. Your cart is safe; please retry.",
      },
      { status: 503 },
    );
  }
}
