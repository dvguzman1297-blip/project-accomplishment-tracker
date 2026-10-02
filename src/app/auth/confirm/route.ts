import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const url = request.nextUrl.clone();
  url.search = "";

  if (tokenHash && request.nextUrl.searchParams.get("type") === "signup") {
    const { error } = await createClient().auth.verifyOtp({ type: "signup", token_hash: tokenHash });
    if (!error) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }
  url.pathname = "/login";
  url.searchParams.set("error", "confirm");
  return NextResponse.redirect(url);
}
