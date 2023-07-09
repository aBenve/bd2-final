import { User } from "index";

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
