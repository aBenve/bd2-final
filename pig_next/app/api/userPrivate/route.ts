import { NextResponse } from "next/server";
import { AccountWithOneIdentifierAndTokenRequest } from "../../../types";
import { fromIdentifierToCBU } from "../../../utils/fromIdentifierToCBU";
import { client } from "../../../service/postgre";
import { checkIfUserIsValid, getPrivateInfo } from "../../../utils/middleware";

export async function GET(req: AccountWithOneIdentifierAndTokenRequest) {
  const searchParams = new URL(req.nextUrl).searchParams;

  try {
    const cbu = (await fromIdentifierToCBU(searchParams, client)) as string;
    const token = searchParams.get("secretToken") as string;

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
