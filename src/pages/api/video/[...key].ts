import type { APIContext } from "astro";

export async function GET({ params, locals }: APIContext) {
  const key = params.key;
  if (!key) {
    return new Response("Missing video key", { status: 400 });
  }

  const bucket = locals.runtime.env.COURSE_BUCKET;
  if (!bucket) {
    return new Response("R2 bucket not configured", { status: 503 });
  }

  const object = await bucket.get(key);
  if (!object) {
    return new Response("Video not found", { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "video/mp4",
      "Content-Length": object.size.toString(),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
