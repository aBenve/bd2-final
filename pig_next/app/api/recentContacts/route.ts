import { NextResponse } from "next/server";
import { client } from "../../../service/postgre";
import {
  AccountWithOneIdentifier,
  AccountWithOneIdentifierAndTokenRequest,
  QueueTransaction,
  UserPublic,
} from "../../../types";
import {
  fromIdentifierToCBU,
  fromIdentifierToUserPublic,
} from "../../../utils/fromIdentifierToCBU";
import {
  checkIfUserIsValid,
  fromSearchParamsToAccountIdentifier,
  getBodyFromRequest,
  forEachMessage,
} from "../../../utils/middleware";

export async function GET(req: AccountWithOneIdentifierAndTokenRequest) {
  try {
    const searchParams = new URL(req.nextUrl).searchParams;
    if (!searchParams) {
      return NextResponse.json({ error: "Missing body" }, { status: 400 });
    }
    const body = await getBodyFromRequest(req);

    const cbu = await fromIdentifierToCBU(
      fromSearchParamsToAccountIdentifier(searchParams),
      client
    );
    const token = body.secret_token;

    if (!(await checkIfUserIsValid(cbu, token))) {
      return NextResponse.json({ error: "User not valid" }, { status: 404 });
    }

    const userQueueName = cbu + "-transactions";
    const toRes = {
      contacts: new Set<string>(),
    };

    await forEachMessage(userQueueName, (message) => {
      const transaction: QueueTransaction = JSON.parse(
        message.content.toString()
      );
      if (transaction.originCBU === cbu) {
        toRes.contacts.add(transaction.destinationCBU);
      } else {
        toRes.contacts.add(transaction.originCBU);
      }
    });

    const response: { contacts: UserPublic[] } = {
      contacts: [],
    };

    const it = toRes.contacts.values();
    while (true) {
      const contactCBU = it.next();

      if (contactCBU.done) {
        break;
      }
      const user = fromIdentifierToUserPublic(
        { cbu: contactCBU.value } as AccountWithOneIdentifier,
        client
      );
      if (user) {
        response.contacts.push(await user);
      }
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
