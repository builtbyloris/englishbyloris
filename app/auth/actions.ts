"use server";

import { redirect } from "next/navigation";

import { getAuthErrorPath } from "@/lib/auth/errors";
import { getSiteUrl } from "@/lib/auth/site-url";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
  const supabase = await createClient();
  const callbackUrl = new URL("/auth/callback", getSiteUrl()).toString();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
      scopes: "openid email profile",
    },
  });

  if (error || !data.url) {
    redirect(getAuthErrorPath("oauth_start_failed"));
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();

  // Validate any presented token before performing the server-side sign-out.
  await supabase.auth.getClaims();

  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    redirect(getAuthErrorPath("signout_failed"));
  }

  redirect("/");
}
