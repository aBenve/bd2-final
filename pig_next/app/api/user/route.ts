import { NextRequest, NextResponse } from "next/server";
import { AccountWithOneIdentifierRequest } from "../../../types";
import { fromIdentifierToCBU } from "../../../utils/fromIdentifierToCBU";
import pgPool from "../../../service/postgre";

export async function GET(req: AccountWithOneIdentifierRequest) {
  try {
    if (!req.body) {
      NextResponse.json({ error: "Missing body" }, { status: 400 });
      return;
    }
    console.log(req);
    const cbu = await fromIdentifierToCBU(req.body, pgPool); // TODO: change to add all public information
    if (!cbu) {
      NextResponse.json({ error: "User not found" }, { status: 404 });
      return;
    }
    NextResponse.json(cbu);
  } catch (error) {
    console.error("Error fetching users:", error);
    NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
  return NextResponse.json({ page: "/api/user" });
}
