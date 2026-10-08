import { redirect } from "next/navigation";

import { getAuthErrorPath } from "@/lib/auth/errors";
import { getAuthState } from "@/lib/auth/profile";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authState = await getAuthState();

  if (authState.status === "signed-out") {
    redirect(getAuthErrorPath("auth_required"));
  }

  if (authState.status === "profile-unavailable") {
    redirect(getAuthErrorPath("profile_unavailable"));
  }

  if (!authState.profile.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <div data-theme={authState.profile.theme ?? undefined}>{children}</div>
  );
}
