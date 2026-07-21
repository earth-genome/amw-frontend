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

  if (!ALLOWED_HOSTS.has(target.hostname)) {
    return new Response("host not allowed", { status: 403 });
  }

  try {
    // server-to-server request, so no CORS is involved
    const upstream = await fetch(target.toString());

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "application/json",
        // let the browser + any CDN cache the proxied response so this route
        // doesn't re-fetch upstream on every request. tune to taste.
        "cache-control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return new Response("upstream fetch failed", { status: 502 });
  }
}