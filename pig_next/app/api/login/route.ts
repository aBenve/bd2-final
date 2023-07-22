import { NextResponse } from "next/server";
import {
  authenticateUser,
  getBodyFromRequest,
} from "../../../utils/middleware";

export async function POST(req: any) {
  const body = getBodyFromRequest(req);

  const { cbu, password } = await body;
  if (!cbu || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const res = await authenticateUser(cbu, password);
  if (res === undefined) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({
    secretToken: res.secretToken,
    email: res.email,
    name: res.name,
    phone: res.phoneNumber,
  });
}
