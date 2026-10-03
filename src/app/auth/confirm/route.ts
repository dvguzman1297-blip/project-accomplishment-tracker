import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Email-link landing: verifies the token, then sends the user on (dashboard, or the new-password page). */
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const url = request.nextUrl.clone();
  url.search = "";

  if (tokenHash && (type === "signup" || type === "recovery")) {
    const { error } = await createClient().auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      url.pathname = type === "recovery" ? "/reset-password" : "/dashboard";
      return NextResponse.redirect(url);
    }
  }
  url.pathname = "/login";
  url.searchParams.set("error", "confirm");
  return NextResponse.redirect(url);
}
