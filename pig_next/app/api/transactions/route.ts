import { NextRequest, NextResponse } from "next/server";
import { Transaction } from "../../../types";
import { checkIfUserIsValid, forEachMessage } from "../../../utils/middleware";

export async function GET(req: NextRequest) {
  const searchParams = new URL(req.nextUrl).searchParams;
  try {
    if (!searchParams.get("cbu") || !searchParams.get("secret_token")) {
      return NextResponse.json(
        { error: "Missing search params" },
        { status: 400 }
      );
    }

    const cbu = searchParams.get("cbu")!;
    const token = searchParams.get("secret_token")!;

    const userQueueName = cbu + "-transactions";

    if (!(await checkIfUserIsValid(cbu, token))) {
      return NextResponse.json({ error: "User not valid" }, { status: 404 });
    }

    const toRes: Transaction[] = [];
    await forEachMessage(userQueueName, (message) => {
      toRes.push(JSON.parse(message.content.toString()) as Transaction);
    });

    return NextResponse.json(toRes);
  } catch (error) {
    console.error("Error making the transaction:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
