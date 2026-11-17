import { NextRequest, NextResponse } from "next/server";
import { METHODOLOGY_CONTACTS_URL } from "@/cms/methodology";
import {
  HONEYPOT_FIELD,
  validateMethodologyContact,
} from "@/utils/methodologyContact";

// Rate limited in src/middleware.ts

const MAX_BODY_BYTES = 10 * 1024;

export async function POST(request: NextRequest) {
  try {
    const API_TOKEN = process.env.STRAPI_METHODOLOGY_CONTACT_TOKEN;

    if (!process.env.STRAPI_API_ENDPOINT || !API_TOKEN) {
      console.error("Methodology contact: missing required environment variables");
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
      return NextResponse.json(
        { error: "unsupported_media_type" },
        { status: 415 },
      );
    }

    const declaredLength = Number(request.headers.get("content-length") || 0);
    if (declaredLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    // Honeypot filled: pretend it worked
    if (
      payload &&
      typeof payload === "object" &&
      typeof (payload as Record<string, unknown>)[HONEYPOT_FIELD] === "string" &&
      ((payload as Record<string, unknown>)[HONEYPOT_FIELD] as string).trim()
    ) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const result = validateMethodologyContact(payload);
    if (!result.ok) {
      return NextResponse.json(
        { error: "validation_failed", errors: result.errors },
        { status: 400 },
      );
    }

    // Token scoped to "create" on this collection only
    const response = await fetch(METHODOLOGY_CONTACTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({ data: result.data }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error(
        "Methodology contact: Strapi save failed",
        response.status,
        errorBody.slice(0, 500),
      );
      return NextResponse.json({ error: "save_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Methodology contact error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
