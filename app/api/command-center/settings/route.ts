import { NextResponse } from "next/server";
import { writeClient } from "@/sanity/write-client";

export async function PUT(request: Request) {
  const role = request.headers.get("x-cc-role");
  if (role !== "owner") {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }

  const body = await request.json();
  const { disabledModules, notificationPreferences } = body;

  if (!Array.isArray(disabledModules) || !Array.isArray(notificationPreferences)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await writeClient.createOrReplace({
    _id: "ccSettings",
    _type: "ccSettings",
    disabledModules,
    notificationPreferences,
  });

  return NextResponse.json({ ok: true });
}
