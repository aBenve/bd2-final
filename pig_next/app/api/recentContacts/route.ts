import { NextRequest, NextResponse } from "next/server";
import {
  AccountIdentifiersWithType,
  AccountWithOneIdentifier,
  Transaction,
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

export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.nextUrl).searchParams;
    if (!searchParams) {
      return NextResponse.json({ error: "Missing body" }, { status: 400 });
    }
    const body = await getBodyFromRequest(req);

    const identifierWithType: AccountIdentifiersWithType = {
      type: body.type,
      ...fromSearchParamsToAccountIdentifier(searchParams),
    };

    const cbu = await fromIdentifierToCBU(identifierWithType);
    const token = body.secret_token;

    if (!(await checkIfUserIsValid(cbu, token))) {
      return NextResponse.json({ error: "User not valid" }, { status: 404 });
    }

    const userQueueName = cbu + "-transactions";
    const toRes = {
      contacts: new Set<AccountIdentifiersWithType>(),
    };

    await forEachMessage(userQueueName, (message) => {
      const transaction: Transaction = JSON.parse(message.content.toString());

      const originCBU = fromIdentifierToCBU({
        type: transaction.originIdentifierType,
        [transaction.originIdentifierType]: transaction.originIdentifier,
      });

      if (originCBU === cbu) {
        toRes.contacts.add({
          type: transaction.destinationIdentifierType,
          [transaction.destinationIdentifierType]:
            transaction.destinationIdentifier,
        });
      } else {
        toRes.contacts.add({
          type: transaction.originIdentifierType,
          [transaction.originIdentifierType]: transaction.originIdentifier,
        });
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

      const contactCBUIdentifierWithType: AccountIdentifiersWithType = {
        type: contactCBU.value.type,
        [contactCBU.value.type]:
          contactCBU.value[
            contactCBU.value.type as keyof AccountWithOneIdentifier
          ],
      };

      const user = fromIdentifierToUserPublic(contactCBUIdentifierWithType);
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
