import { redirect } from "next/navigation";

// Sign-in has been removed — no account system. Send any /login hit home.
export default function LoginPage() {
  redirect("/");
}
