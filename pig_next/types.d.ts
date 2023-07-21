import { NextRequest } from "next/server";

export interface User {
  name: string;
  uuid: string;
  email: string;
  phone: string;
  cbu: string;
  secret_token: string;
  alias: string;
  creation_date: Date;
}

export interface UserPublic {
  name: string;
  cbu: string;
}
export interface Transaction {
  originIdentifier: AccountWithOneIdentifier;
  destinationIdentifier: AccountWithOneIdentifier;
  amount: number;
  date: Date;
}

export interface AccountIdentifiers {
  uuid?: string;
  name?: string;
  cbu?: string;
  phone?: string;
  email?: string;
}

export type AccountWithOneIdentifier = Pick<
  AccountIdentifiers,
  "cbu" | "email" | "name" | "phone" | "uuid"
>;
export interface QueueTransaction {
  originCBU: string;
  destinationCBU: string;
  balance: number;
  date: Date;
}

export interface AccountWithOneIdentifierRequest extends NextRequest {
  body: AccountWithOneIdentifier;
}

export interface AccountWithOneIdentifierAndTokenRequest extends NextRequest {
  body: AccountWithOneIdentifier & { secret_token: string };
}

export interface TransactionRequest extends NextRequest {
  body: Transaction;
}
