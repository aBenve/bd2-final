import { NextResponse } from "next/server";
import { AccountWithOneIdentifierAndTokenRequest } from "../../../types";
import { fromIdentifierToCBU } from "../../../utils/fromIdentifierToCBU";
import pgPool from "../../../service/postgre";
import { checkIfUserIsValid, getPrivateInfo } from "../../../utils/middleware";

export async function GET(req: AccountWithOneIdentifierAndTokenRequest) {
  try {
    const cbu = (await fromIdentifierToCBU(req.body, pgPool)) as string;
    const token = req.body.secret_token;

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
