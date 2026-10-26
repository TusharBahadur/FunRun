import { permanentRedirect } from "next/navigation";

/** Gifts now live on the profile page. */
export default function MyGiftsPage() {
  permanentRedirect("/profile");
}
