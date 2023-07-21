import { Client, QueryResult } from "pg";
import { AccountWithOneIdentifier } from "../types";

export function fromIdentifierToUserPublic(
  accountIdentifier: AccountWithOneIdentifier,
  client: Client
) {
  const select = "SELECT cbu, name FROM users ";
  const selectToUser = (res: QueryResult) => res.rows[0];
  console.log(accountIdentifier);
  try {
    if (accountIdentifier.uuid)
      return client
        .query(select + "WHERE uuid = $1", [accountIdentifier.uuid])
        .then(selectToUser);
    if (accountIdentifier.name)
      return client
        .query(select + "WHERE name = $1", [accountIdentifier.name])
        .then(selectToUser);
    if (accountIdentifier.cbu)
      return client
        .query(select + "WHERE cbu = $1", [accountIdentifier.cbu])
        .then(selectToUser);
    if (accountIdentifier.phone)
      return client
        .query(select + "WHERE phone = $1", [accountIdentifier.phone])
        .then(selectToUser);
    if (accountIdentifier.email)
      return client
        .query(select + "WHERE email = $1", [accountIdentifier.email])
        .then(selectToUser);
  } catch (error) {
    console.log(error);
  }
}

export function fromIdentifierToCBU(
  accountIdentifier: AccountWithOneIdentifier,
  client: Client
) {
  const select = "SELECT cbu FROM users ";
  const selectToCBU = (res: QueryResult) =>
    res.rows[0] ? res.rows[0].cbu : undefined;
  try {
    if (accountIdentifier.uuid)
      return client
        .query(select + "WHERE uuid = $1", [accountIdentifier.uuid])
        .then(selectToCBU);
    if (accountIdentifier.name)
      return client
        .query(select + "WHERE name = $1", [accountIdentifier.name])
        .then(selectToCBU);
    if (accountIdentifier.cbu)
      return client
        .query(select + "WHERE cbu = $1", [accountIdentifier.cbu])
        .then(selectToCBU);
    if (accountIdentifier.phone)
      return client
        .query(select + "WHERE phone = $1", [accountIdentifier.phone])
        .then(selectToCBU);
    if (accountIdentifier.email)
      return client
        .query(select + "WHERE email = $1", [accountIdentifier.email])
        .then(selectToCBU);
  } catch (error) {
    console.log(error);
  }
}
