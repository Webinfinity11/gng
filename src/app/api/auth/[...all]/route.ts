import { getAuth } from "@/lib/auth";
import { isAuthConfigured } from "@/lib/config";
export const runtime = "nodejs";
async function handler(request: Request) {
  if (!isAuthConfigured()) return Response.json({ error: "Authentication is not configured." }, { status: 503 });
  return getAuth().handler(request);
}
export { handler as GET, handler as POST };
