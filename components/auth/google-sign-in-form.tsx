import { signInWithGoogle } from "@/app/auth/actions";

export function GoogleSignInForm() {
  return (
    <form action={signInWithGoogle} className="auth-form">
      <button className="button button-primary" type="submit">
        Continue with Google
      </button>
    </form>
  );
}
