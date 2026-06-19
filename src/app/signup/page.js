import { redirect } from "next/navigation";

// Sign-up has been removed — no account system. Send any /signup hit home.
export default function SignupPage() {
  redirect("/");
}
