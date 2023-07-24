import { NextRequest, NextResponse } from "next/server";
import { fromIdentifierToCBU } from "../../../utils/fromIdentifierToCBU";

export async function GET(req: NextRequest) {
  const searchParams = new URL(req.nextUrl).searchParams;
  try {
    if (!searchParams.has("type") || !searchParams.has("identifier")) {
      return NextResponse.json(
        { error: "Missing search params" },
        { status: 400 }
      );
    }

    const identifierWithType = {
      type: searchParams.get("type")!,
      [searchParams.get("type")!]: searchParams.get("identifier")!,
    };

    const cbu = await fromIdentifierToCBU(identifierWithType);

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
