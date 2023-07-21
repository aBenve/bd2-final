import { NextResponse } from "next/server";
import { AccountWithOneIdentifierRequest } from "../../../types";
import { fromIdentifierToCBU } from "../../../utils/fromIdentifierToCBU";
import { client } from "../../../service/postgre";
import { fromSearchParamsToAccountIdentifier } from "../../../utils/middleware";

export async function GET(req: AccountWithOneIdentifierRequest) {
  const searchParams = new URL(req.nextUrl).searchParams;
  try {
    if (!searchParams) {
      return NextResponse.json({ error: "Missing body" }, { status: 400 });
    }

    const cbu = await fromIdentifierToCBU(
      fromSearchParamsToAccountIdentifier(searchParams),
      client
    ); // TODO: change to add all public information
    if (!cbu) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(cbu);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
