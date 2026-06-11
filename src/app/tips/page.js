import { redirect } from "next/navigation";

// Tips page is hidden — there's no live tips feed. Send tip links to the news feed.
export default function TipsRedirect() {
  redirect("/news");
}
