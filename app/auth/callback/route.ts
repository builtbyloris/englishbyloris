import { NextResponse, type NextRequest } from "next/server";

import { getAuthErrorPath } from "@/lib/auth/errors";
import { getAuthState, getProfileDestination } from "@/lib/auth/profile";
import { toSiteUrl } from "@/lib/auth/site-url";
import { createClient } from "@/lib/supabase/server";

function redirectWithError(code: Parameters<typeof getAuthErrorPath>[0]) {
  return NextResponse.redirect(toSiteUrl(getAuthErrorPath(code)));
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  if (
    requestUrl.searchParams.has("error") ||
    requestUrl.searchParams.has("error_code")
  ) {
    return redirectWithError("oauth_cancelled");
  }

  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return redirectWithError("missing_code");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectWithError("callback_failed");
  }

  const authState = await getAuthState(supabase);

  if (authState.status === "signed-out") {
    return redirectWithError("callback_failed");
  }

  if (authState.status === "profile-unavailable") {
    return redirectWithError("profile_unavailable");
  }

  return NextResponse.redirect(
    toSiteUrl(getProfileDestination(authState.profile)),
  );
}
