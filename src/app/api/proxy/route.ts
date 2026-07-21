// allowlist of hosts this proxy is permitted to fetch from — prevents the
// route being used as an open proxy for arbitrary URLs
const ALLOWED_HOSTS = new Set(["media-amw.earthgenome.org"]);

export async function GET(req: Request) {
  const src = new URL(req.url).searchParams.get("src");
  if (!src) {
    return new Response("missing src", { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return new Response("invalid src", { status: 400 });
  }

  if (
    target.protocol !== "https:" ||
    target.port !== "" ||
    !ALLOWED_HOSTS.has(target.hostname)
  ) {
    return new Response("host not allowed", { status: 403 });
  }

  try {
    // server-to-server request, so no CORS is involved.
    // redirect: "manual" prevents fetch from auto-following a 3xx — otherwise
    // an allowlisted host could redirect to an internal/arbitrary URL that is
    // never re-checked against ALLOWED_HOSTS (SSRF bypass).
    const upstream = await fetch(target.toString(), {
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });

    // these files should be served directly (200); treat any redirect as a
    // refusal rather than following it to an unvalidated location.
    if (upstream.status >= 300 && upstream.status < 400) {
      return new Response("upstream redirect not allowed", { status: 502 });
    }

    const headers: Record<string, string> = {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
      "x-content-type-options": "nosniff",
    };
    if (upstream.ok) {
      // let the browser + any CDN cache the proxied response so this route
      // doesn't re-fetch upstream on every request. tune to taste.
      headers["cache-control"] =
        "public, max-age=300, stale-while-revalidate=600";
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch {
    return new Response("upstream fetch failed", { status: 502 });
  }
}
