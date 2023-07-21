import { Client, Pool } from "pg";
import { AccountWithOneIdentifier } from "../types";

export function fromIdentifierToCBU(
  accountIdentifier: URLSearchParams,
  pool: Client
) {
  if (accountIdentifier.get("uuid"))
    return pool
      .query("SELECT cbu FROM users WHERE uuid = $1", [
        accountIdentifier.get("uuid"),
      ])
      .then((res) => res.rows[0]);
  if (accountIdentifier.get("name"))
    return pool
      .query("SELECT cbu FROM users WHERE name = $1", [
        accountIdentifier.get("name"),
      ])
      .then((res) => res.rows[0]);
  if (accountIdentifier.get("cbu"))
    return pool
      .query("SELECT cbu FROM users WHERE cbu = $1", [
        accountIdentifier.get("cbu"),
      ])
      .then((res) => res.rows[0]);
  if (accountIdentifier.get("phone"))
    return pool
      .query("SELECT cbu FROM users WHERE phone = $1", [
        accountIdentifier.get("phone"),
      ])
      .then((res) => res.rows[0]);
  if (accountIdentifier.get("email"))
    return pool
      .query("SELECT cbu FROM users WHERE email = $1", [
        accountIdentifier.get("email"),
      ])
      .then((res) => res.rows[0]);
}
