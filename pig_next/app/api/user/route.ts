import { NextRequest, NextResponse } from "next/server";
import { fromIdentifierToCBU } from "../../../utils/fromIdentifierToCBU";
import { User, UserRequest } from "../../../types";
import { getBodyFromRequest } from "../../../utils/middleware";
import client from "../../../service/postgre";

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

export async function POST(req: UserRequest) {
  const body = await getBodyFromRequest(req);
  const { name, alias, phone, email, secret_token, cbu, creation_date } =
    (await body) as unknown as User;

  try {
    if (!body) {
      return NextResponse.json({ error: "Missing body" }, { status: 400 });
    }

    const res = await client.query(
      `
      INSERT INTO users (name, email, phone, cbu, secret_token, alias, creation_date)
      VALUES ('${name}', '${email}', '${phone}', '${cbu}', '${secret_token}', '${alias}', '${creation_date}')
      ON CONFLICT DO NOTHING;
    `
    );

    if (res === undefined) {
      return NextResponse.json(
        { error: "There was a problem creating the user" },
        { status: 401 }
      );
    }
    return NextResponse.json({
      message: "User created successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
