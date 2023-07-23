import { NextRequest, NextResponse } from "next/server";
import {
  QueueTransaction,
  Transaction,
  TransactionRequest,
} from "../../../types";
import {
  getBodyFromRequest,
  iniciateTransaction,
} from "../../../utils/middleware";
import { client } from "../../../service/postgre";
import { rabbitChannel } from "../../../service/rabbitmq";
import { fromIdentifierToCBU } from "../../../utils/fromIdentifierToCBU";

export async function POST(req: NextRequest) {
  try {
    const body = await getBodyFromRequest(req);
    const {
      originIdentifierType,
      destinationIdentifierType,
      originIdentifier,
      destinationIdentifier,
      balance,
    } = body as unknown as Transaction;
    if (!originIdentifier || !destinationIdentifier || !balance) {
      return NextResponse.json({ error: "Missing body" }, { status: 400 });
    }
    const originCBU = await fromIdentifierToCBU(
      {
        type: originIdentifierType,
        [originIdentifierType]: originIdentifier,
      },
      client
    );
    const destinationCBU = await fromIdentifierToCBU(
      {
        type: destinationIdentifierType,
        [destinationIdentifierType]: destinationIdentifier,
      },
      client
    );
    if (!originCBU || !destinationCBU) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const originToken = (
      await client.query("SELECT secret_token FROM users WHERE cbu = $1", [
        originCBU,
      ])
    ).rows[0].secret_token;
    const destinationToken = (
      await client.query("SELECT secret_token FROM users WHERE cbu = $1", [
        destinationCBU,
      ])
    ).rows[0].secret_token;

    if (
      await iniciateTransaction(
        originCBU,
        originToken,
        destinationCBU,
        destinationToken,
        body.amount
      )
    ) {
      const msg: Transaction = {
        originIdentifierType,
        destinationIdentifierType,
        originIdentifier,
        destinationIdentifier,
        balance: body.amount,
        date: new Date(),
      };

      const userQueueName = originCBU + "-transactions";
      rabbitChannel.assertQueue(userQueueName, { durable: true });
      rabbitChannel.sendToQueue(
        "transactions",
        Buffer.from(JSON.stringify(msg)),
        {
          persistent: true,
        }
      );
      rabbitChannel.sendToQueue(
        userQueueName,
        Buffer.from(JSON.stringify(msg)),
        {
          persistent: true,
        }
      );
      NextResponse.json(
        { message: "Transaction sent to queue" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
