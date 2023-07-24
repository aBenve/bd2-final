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
import client from "../../../service/postgre";
import { rabbitChannelPromise } from "../../../service/rabbitmq";
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

    let originCBU: string;

    if (originIdentifierType === "cbu") {
      originCBU = originIdentifier;
    } else {
      originCBU = await fromIdentifierToCBU({
        type: originIdentifierType,
        [originIdentifierType]: originIdentifier,
      });
    }

    let destinationCBU: string;

    if (destinationIdentifierType === "cbu") {
      destinationCBU = destinationIdentifier;
    } else {
      destinationCBU = await fromIdentifierToCBU({
        type: destinationIdentifierType,
        [destinationIdentifierType]: destinationIdentifier,
      });
    }

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
        body.balance
      )
    ) {
      const originMsg: Transaction = {
        originIdentifierType,
        destinationIdentifierType,
        originIdentifier,
        destinationIdentifier,
        balance: body.balance,
        date: new Date(),
      };
      const destinationMsg: Transaction = {
        originIdentifierType: destinationIdentifierType,
        destinationIdentifierType: originIdentifierType,
        originIdentifier: destinationIdentifier,
        destinationIdentifier: originIdentifier,
        balance: body.balance,
        date: new Date(),
      };

      const originQueueName = originCBU + "-transactions";
      const destinationQueueName = destinationCBU + "-transactions";
      (await rabbitChannelPromise).assertQueue(originQueueName, {
        durable: true,
      });
      (await rabbitChannelPromise).assertQueue(destinationQueueName, {
        durable: true,
      });
      (await rabbitChannelPromise).sendToQueue(
        "transactions",
        Buffer.from(JSON.stringify(originMsg)),
        {
          persistent: true,
        }
      );
      (await rabbitChannelPromise).sendToQueue(
        originQueueName,
        Buffer.from(JSON.stringify(originMsg)),
        {
          persistent: true,
        }
      );
      (await rabbitChannelPromise).sendToQueue(
        destinationQueueName,
        Buffer.from(JSON.stringify(destinationMsg)),
        {
          persistent: true,
        }
      );
      return NextResponse.json(
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
