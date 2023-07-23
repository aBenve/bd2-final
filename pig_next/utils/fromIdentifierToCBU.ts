import { Client, QueryResult } from "pg";
import { AccountIdentifiersWithType } from "../types";
import client from "../service/postgre";

export async function fromIdentifierToUserPublic(
  accountIdentifierWithType: AccountIdentifiersWithType
) {
  //await client.connect();
  const select = "SELECT cbu, name FROM users ";
  const selectToUser = (res: QueryResult) => res.rows[0];

  const query = `${select} WHERE ${accountIdentifierWithType.type}='${
    accountIdentifierWithType[
      accountIdentifierWithType.type as keyof AccountIdentifiersWithType
    ]
  }'`;

  try {
    return client.query(query).then(selectToUser);
  } catch (error) {
    console.log(error);
  }
}

export async function fromIdentifierToCBU(
  accountIdentifierWithType: AccountIdentifiersWithType
) {
  //await client.connect();
  const select = "SELECT cbu FROM users ";
  const selectToCBU = (res: QueryResult) =>
    res.rows[0] ? res.rows[0].cbu : undefined;

  const query = `${select} WHERE ${accountIdentifierWithType.type}='${
    accountIdentifierWithType[
      accountIdentifierWithType.type as keyof AccountIdentifiersWithType
    ]
  }'`;

  try {
    return client.query(query).then(selectToCBU);
  } catch (error) {
    console.log(error);
  }
}
