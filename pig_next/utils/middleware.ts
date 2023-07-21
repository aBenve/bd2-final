import { User } from "../types";

const POSTGRE_BANK_API = process.env.POSTGRE_BANK_API as string;
const MONGO_BANK_API = process.env.MONGO_BANK_API;

const BANK_ENDPOINTS = {
  isUser: { endpoint: "/isUser", method: "GET" },
  verifyUser: { endpoint: "/verifyUser", method: "GET" },
  authenticateUser: { endpoint: "/authenticateUser", method: "POST" },
  userPrivate: { endpoint: "/user", method: "GET" },
  userPublic: { endpoint: "/getUser", method: "GET" },
  initiateTransaction: { endpoint: "/initiateTransaction", method: "POST" },
  addFunds: { endpoint: "/addFunds", method: "POST" },
  removeFunds: { endpoint: "/removeFunds", method: "POST" },
  endTransaction: { endpoint: "/endTransaction", method: "POST" },
};

interface CBU_BANK_API_REFERENCE {
  "000": string;
  "002": string;
}

const CBU_BANK_API_REFERENCE: CBU_BANK_API_REFERENCE = {
  "000": POSTGRE_BANK_API,
  "002": MONGO_BANK_API!,
};
function getEndpoint(cbu: string, endpoint: string) {
  return (
    String(
      CBU_BANK_API_REFERENCE[
        cbu.substring(0, 3) as keyof CBU_BANK_API_REFERENCE
      ]
    ) + endpoint
  );
}
export async function checkIfUserIsValid(
  cbu: string,
  token: string
): Promise<Boolean> {
  const options = {
    method: BANK_ENDPOINTS.verifyUser.method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  const res = await fetch(
    getEndpoint(cbu, BANK_ENDPOINTS.verifyUser.endpoint) +
      `?cbu=${cbu}` +
      `&secretToken=${token}`,
    options
  );
  return res.ok;
}

export async function getPrivateInfo(
  cbu: string,
  token: string
): Promise<User> {
  const options = {
    method: BANK_ENDPOINTS.userPrivate.method,
  };
  const res = await fetch(
    getEndpoint(cbu, BANK_ENDPOINTS.userPrivate.endpoint) +
      `?cbu=${cbu}` +
      `&secretToken=${token}`,
    options
  );
  return (await res.json()) as User;
}
