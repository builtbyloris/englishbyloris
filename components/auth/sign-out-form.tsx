import { signOut } from "@/app/auth/actions";

export function SignOutForm() {
  return (
    <form action={signOut} className="auth-form">
      <button className="button button-secondary" type="submit">
        Log out
      </button>
    </form>
  );
}
