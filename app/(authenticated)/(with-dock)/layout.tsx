import Link from "next/link";

import { SignOutForm } from "@/components/auth/sign-out-form";
import { BottomDock } from "@/components/navigation/bottom-dock";

export default function DockLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-shell authenticated-shell">
      <header className="app-container authenticated-header">
        <Link className="wordmark wordmark-small app-wordmark" href="/home">
          englishbyloris
        </Link>
        <SignOutForm />
      </header>
      <main className="app-container authenticated-content">{children}</main>
      <BottomDock />
    </div>
  );
}
