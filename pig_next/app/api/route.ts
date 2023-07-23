import { NextResponse } from "next/server";
import { client } from "../../service/postgre";

export async function GET() {
  if (!client) {
    return NextResponse.json({ error: "PostgreClient not initialized" });
  }
  return NextResponse.json({
    routes: {
      "/checkFunds": {
        method: "GET",
        description: "Return user balance",
        params: {
          cbu: "string",
          secret_token: "string",
        },
        response: {
          balance: "number",
        },
      },
      "/login": {
        method: "POST",
        description: "Login user",
        body: {
          cbu: "string",
          password: "string",
        },
        response: {
          secret_token: "string",
          email: "string",
          name: "string",
          phone: "string",
        },
      },
      "/makeTransaction": {
        method: "POST",
        description: "Make a transaction",
        body: {
          originIdentifierType: "string",
          destinationIdentifierType: "string",
          originIdentifier: "string",
          destinationIdentifier: "string",
          balance: "number",
        },
        response: {
          message: "string",
        },
      },
      "/transactions": {
        method: "GET",
        description: "Get all transactions",
        params: {
          cbu: "string",
          secret_token: "string",
        },
        response: {
          transactions: [
            {
              originIdentifierType: "string",
              destinationIdentifierType: "string",
              originIdentifier: "string",
              destinationIdentifier: "string",
              balance: "number",
            },
          ],
        },
      },
      "/user": {
        method: "GET",
        description: "Get user info",
        params: {
          identifier: "string",
          type: "string",
        },
        response: {
          cbu: "string",
        },
      },
      "/userPrivate": {
        method: "GET",
        description: "Get user info",
        params: {
          identifier: "string",
          type: "string",
          secret_token: "string",
        },
        response: {
          cbu: "string",
          email: "string",
          name: "string",
          phone: "string",
        },
      },
    },
  });
}
