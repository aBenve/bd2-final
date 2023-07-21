import { Pool } from "pg";
import { AccountWithOneIdentifier } from "../types";

export function fromIdentifierToCBU(
  accountIdentifier: AccountWithOneIdentifier,
  pool: Pool
) {
  if (accountIdentifier.uuid)
    return pool
      .query("SELECT cbu FROM users WHERE uuid = $1", [accountIdentifier.uuid])
      .then((res) => res.rows[0]);
  if (accountIdentifier.name)
    return pool
      .query("SELECT cbu FROM users WHERE name = $1", [accountIdentifier.name])
      .then((res) => res.rows[0]);
  if (accountIdentifier.cbu)
    return pool
      .query("SELECT cbu FROM users WHERE cbu = $1", [accountIdentifier.cbu])
      .then((res) => res.rows[0]);
  if (accountIdentifier.phone)
    return pool
      .query("SELECT cbu FROM users WHERE phone = $1", [
        accountIdentifier.phone,
      ])
      .then((res) => res.rows[0]);
  if (accountIdentifier.email)
    return pool
      .query("SELECT cbu FROM users WHERE email = $1", [
        accountIdentifier.email,
      ])
      .then((res) => res.rows[0]);
}
