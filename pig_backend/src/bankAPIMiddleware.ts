import { User } from "index";

const POSTGRE_BANK_API = process.env.POSTGRE_BANK_API;
const MONGO_BANK_API = process.env.MONGO_BANK_API;

export function checkIfUserExists(cbu: string): Boolean {
  return true;
}

export function checkIfUserIsValid(cbu: string, token: string): Boolean {
  return true;
}
export function iniciateTransaction(
  originCBU: string,
  destinationCBU: string,
  amount: string
) {
  if (!checkIfUserExists(originCBU) || !checkIfUserExists(destinationCBU)) {
    return false;
  }
}
export function getPrivateInfo(cbu: string, token: string): User {
  return {} as User;
}
