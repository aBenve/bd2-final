import { NextRequest, NextResponse } from "next/server";
import { fromIdentifierToCBU } from "../../../utils/fromIdentifierToCBU";
import { client } from "../../../service/postgre";
import {
  fromSearchParamsToAccountIdentifier,
  getUserBalance,
} from "../../../utils/middleware";

export async function GET(req: NextRequest) {
  const searchParams = new URL(req.nextUrl).searchParams;
  try {
    if (!searchParams.get("cbu") || !searchParams.get("secret_token")) {
      return NextResponse.json(
        { error: "Missing cbu or secret_token" },
        { status: 400 }
      );
    }

    const cbu = searchParams.get("cbu");
    const secret_token = searchParams.get("secret_token");

    const balance = await getUserBalance({
      cbu: cbu!,
      secret_token: secret_token!,
    });

    return NextResponse.json({ balance }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
