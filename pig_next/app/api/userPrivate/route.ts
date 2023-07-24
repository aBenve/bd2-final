import { NextRequest, NextResponse } from "next/server";
import { fromIdentifierToCBU } from "../../../utils/fromIdentifierToCBU";
import client from "../../../service/postgre";
import { checkIfUserIsValid, getPrivateInfo } from "../../../utils/middleware";

export async function GET(req: NextRequest) {
  const searchParams = new URL(req.nextUrl).searchParams;

  try {
    if (
      !searchParams.get("secret_token") ||
      !searchParams.get("identifier") ||
      !searchParams.get("type")
    ) {
      return NextResponse.json(
        { error: "Missing search params" },
        { status: 400 }
      );
    }

    const identifierWithType = {
      type: searchParams.get("type")!,
      [searchParams.get("type")!]: searchParams.get("identifier")!,
    };

    const cbu = (await fromIdentifierToCBU(identifierWithType)) as string;
    const token = searchParams.get("secret_token") as string;

    if (!(await checkIfUserIsValid(cbu, token))) {
      NextResponse.json({ error: "User not Valid" }, { status: 401 });
      return;
    }
    const user = await getPrivateInfo(cbu, token);
    NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching users:", error);
    NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
