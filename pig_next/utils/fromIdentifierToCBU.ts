import { Client, QueryResult } from "pg";
import { AccountIdentifiersWithType } from "../types";

export function fromIdentifierToUserPublic(
  accountIdentifierWithType: AccountIdentifiersWithType,
  client: Client
) {
  const select = "SELECT cbu, name FROM users ";
  const selectToUser = (res: QueryResult) => res.rows[0];
  try {
    return client
      .query(select + "WHERE $1 = $2", [
        accountIdentifierWithType.type,
        accountIdentifierWithType[
          accountIdentifierWithType.type as keyof AccountIdentifiersWithType
        ],
      ])
      .then(selectToUser);
  } catch (error) {
    console.log(error);
  }
}

export function fromIdentifierToCBU(
  accountIdentifierWithType: AccountIdentifiersWithType,
  client: Client
) {
  const select = "SELECT cbu FROM users ";
  const selectToCBU = (res: QueryResult) =>
    res.rows[0] ? res.rows[0].cbu : undefined;
  try {
    return client
      .query(select + "WHERE $1 = $2", [
        accountIdentifierWithType.type,
        accountIdentifierWithType[
          accountIdentifierWithType.type as keyof AccountIdentifiersWithType
        ],
      ])
      .then(selectToCBU);
  } catch (error) {
    console.log(error);
  }
}
