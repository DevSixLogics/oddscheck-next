import { redirect } from "next/navigation";

// The experts/bookmakers listing now lives at /experts. Keep /reviews working.
export default function ReviewsRedirect() {
  redirect("/experts");
}
