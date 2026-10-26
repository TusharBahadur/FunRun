import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabase/admin";

/**
 * Counts one open of a gift. The gift page calls this once per browser, and the
 * sender's own browser is marked when they publish, so their peeks don't count.
 */
export async function POST(_request: Request, { params }: RouteContext<"/api/gifts/[slug]/open">) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{3,48}$/.test(slug)) return new NextResponse(null, { status: 204 });
  const { error } = await getAdmin().rpc("record_gift_open", { p_slug: slug });
  if (error) console.error("[gifts] open count failed", error.message);
  return new NextResponse(null, { status: 204 });
}
