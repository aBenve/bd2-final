import { NextResponse } from "next/server";
import {
  AccountWithOneIdentifierAndTokenRequest,
  QueueTransaction,
  Transaction,
} from "../../../types";
import { fromIdentifierToCBU } from "../../../utils/fromIdentifierToCBU";
import {
  checkIfUserIsValid,
  forEachMessage,
  fromSearchParamsToAccountIdentifier,
} from "../../../utils/middleware";
import { client } from "../../../service/postgre";
import { rabbitChannel } from "../../../service/rabbitmq";

export async function GET(req: AccountWithOneIdentifierAndTokenRequest) {
  const searchParams = new URL(req.nextUrl).searchParams;
  try {
    if (!searchParams) {
      return NextResponse.json({ error: "Missing body" }, { status: 400 });
    }

    const cbu = await fromIdentifierToCBU(
      fromSearchParamsToAccountIdentifier(searchParams),
      client
    );
    if (!cbu) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userQueueName = cbu + "-transactions";
    const token = searchParams.get("secretToken")!;

    if (!(await checkIfUserIsValid(cbu, token))) {
      return NextResponse.json({ error: "User not valid" }, { status: 404 });
    }

    const toRes: {
      transactions: QueueTransaction[];
    } = {
      transactions: [],
    };
    await forEachMessage(userQueueName, (message) =>
      toRes.transactions.push(
        JSON.parse(message.content.toString()) as QueueTransaction
      )
    );

    return NextResponse.json(toRes);
  } catch (error) {
    console.error("Error making the transaction:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
