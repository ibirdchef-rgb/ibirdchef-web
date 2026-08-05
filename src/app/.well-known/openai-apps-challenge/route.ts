/**
 * OpenAI Apps domain-verification challenge endpoint.
 * Returns only the challenge token from environment configuration.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const token =
    process.env.OPENAI_APPS_DOMAIN_CHALLENGE?.trim() ||
    process.env.ANS_DOMAIN_VERIFICATION_CHALLENGE?.trim();

  if (!token) {
    return new Response("Domain verification challenge is not configured.", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  return new Response(token, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
