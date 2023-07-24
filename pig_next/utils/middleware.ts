import { GetMessage } from "amqplib";
import { rabbitChannelPromise } from "../service/rabbitmq";
import { User, NewUserInfo, AccountIdentifiers } from "../types";

const POSTGRE_BANK_API = process.env.POSTGRE_BANK_API;
const MONGO_BANK_API = process.env.MONGO_BANK_API;

const BANK_ENDPOINTS = {
  isUser: { endpoint: "/isUser", method: "GET" },
  checkFunds: { endpoint: "/checkFunds", method: "GET" },
  verifyUser: { endpoint: "/verifyUser", method: "POST" },
  authenticateUser: { endpoint: "/authorizeUser", method: "POST" },
  userPrivate: { endpoint: "/userPrivate", method: "GET" },
  userPublic: { endpoint: "/getUser", method: "GET" },
  initiateTransaction: { endpoint: "/initiateTransaction", method: "POST" },
  addFunds: { endpoint: "/addFunds", method: "PATCH" },
  removeFunds: { endpoint: "/removeFunds", method: "PATCH" },
  endTransaction: { endpoint: "/endTransaction", method: "POST" },
};

interface CBU_BANK_API_REFERENCE {
  "000": string;
  "002": string;
}

const CBU_BANK_API_REFERENCE = {
  "000": POSTGRE_BANK_API,
  "002": MONGO_BANK_API,
};

function getEndpoint(cbu: string, endpoint: string) {
  return (
    CBU_BANK_API_REFERENCE[
      cbu.substring(0, 3) as keyof CBU_BANK_API_REFERENCE
    ] + endpoint
  );
}

export function fromSearchParamsToAccountIdentifier(
  searchParams: URLSearchParams
): Pick<AccountIdentifiers, "cbu" | "email" | "name" | "phone"> {
  if (searchParams.get("cbu")) {
    return { cbu: searchParams.get("cbu") as string };
  }
  if (searchParams.get("email")) {
    return { email: searchParams.get("email") as string };
  }
  if (searchParams.get("name")) {
    return { name: searchParams.get("name") as string };
  }
  if (searchParams.get("phone")) {
    return { phone: searchParams.get("phone") as string };
  }
  throw new Error("No valid identifier found");
}

function addParamsToBody(options: RequestInit, params: { [key: string]: any }) {
  return { ...options, body: JSON.stringify(params) };
}

function addParamsToRequest(
  endpoint: string,
  params: { name: string; value: any }[]
) {
  return (
    endpoint +
    "?" +
    params.map((param) => (param.name + "=" + param.value) as string).join("&")
  );
}

export async function getUserBalance({
  cbu,
  secret_token,
}: {
  cbu: string;
  secret_token: string;
}) {
  const options = {
    method: BANK_ENDPOINTS.checkFunds.method,
  };
  const res = await fetch(
    getEndpoint(cbu, BANK_ENDPOINTS.checkFunds.endpoint) +
      `?cbu=${cbu}` +
      `&secretToken=${secret_token}`,
    options
  );
  return await res.json();
}

export async function checkIfUserExists(cbu: string): Promise<Boolean> {
  const options: RequestInit = {
    method: BANK_ENDPOINTS.isUser.method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = await fetch(
    getEndpoint(cbu, BANK_ENDPOINTS.isUser.endpoint) + `?cbu=${cbu}`,
    options
  );
  return res.ok;
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
    body: JSON.stringify({
      cbu,
      secretToken: token,
    }),
  };
  const res = await fetch(
    getEndpoint(cbu, BANK_ENDPOINTS.verifyUser.endpoint),
    options
  );
  return res.ok;
}

export async function authenticateUser(
  cbu: string,
  password: string
): Promise<NewUserInfo | undefined> {
  let options = {
    method: BANK_ENDPOINTS.authenticateUser.method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  options = addParamsToBody(options, { cbu, password });

  const res = await fetch(
    getEndpoint(cbu, BANK_ENDPOINTS.authenticateUser.endpoint),
    options
  );

  if (res.status === 400) {
    return undefined;
  }
  return res.json();
}

export async function iniciateTransaction(
  originCBU: string,
  originSecretToken: string,
  destinationCBU: string,
  destinationSecretToken: string,
  balance: string
): Promise<Boolean> {
  // Initiate Transactions with banks
  const transactionIds = {
    origin: "",
    destination: "",
  };
  // Send request to origin bank
  let options = {
    method: BANK_ENDPOINTS.initiateTransaction.method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  let initTransactionEndpoint = getEndpoint(
    originCBU,
    BANK_ENDPOINTS.initiateTransaction.endpoint
  );

  options = addParamsToBody(options, {
    cbu: originCBU,
    amount: balance,
    secretToken: originSecretToken,
  });

  let res = await fetch(initTransactionEndpoint, options);

  if (!res.ok) {
    return false;
  }

  transactionIds.origin = await res.text();

  options = {
    method: BANK_ENDPOINTS.initiateTransaction.method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  initTransactionEndpoint = getEndpoint(
    destinationCBU,
    BANK_ENDPOINTS.initiateTransaction.endpoint
  );

  options = addParamsToBody(options, {
    cbu: destinationCBU,
    amount: balance,
    secretToken: destinationSecretToken,
  });

  res = await fetch(initTransactionEndpoint, options);

  if (!res.ok) {
    return false;
  }

  transactionIds.destination = await res.text();

  const endTransactions = async () => {
    const allOk = await Promise.all([
      endTransaction(originCBU, transactionIds.origin),
      endTransaction(destinationCBU, transactionIds.destination),
    ]);
    return !allOk.includes(false);
  };

  // Add and remove funds
  if (
    !(await removeFunds(
      originCBU,
      balance,
      transactionIds.origin,
      originSecretToken
    ))
  ) {
    if (!(await endTransactions())) {
      console.error(
        `ERROR: transaction could not be finished for transactions ${transactionIds}`
      );
    }
    return false;
  }

  if (
    !(await addFunds(
      destinationCBU,
      balance,
      transactionIds.destination,
      destinationSecretToken
    ))
  ) {
    if (
      !(await addFunds(
        originCBU,
        balance,
        transactionIds.origin,
        originSecretToken
      ))
    ) {
      console.error(
        `ERROR: Funds (${balance}) were removed from ${originCBU} but could not be returned after failure.`
      );
      return false;
    }
    if (!(await endTransactions())) {
      console.error(
        `ERROR: Funds were returned after failure but transactions(${transactionIds}) could not be ended`
      );
    }
    return false;
  }

  // Signal end of transaction
  return await endTransactions();
}

// returns if ok
async function addFunds(
  cbu: string,
  amount: string,
  transactionId: string,
  secretToken: string
): Promise<Boolean> {
  let options = {
    method: BANK_ENDPOINTS.addFunds.method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  let endpoint = getEndpoint(cbu, BANK_ENDPOINTS.addFunds.endpoint);

  options = addParamsToBody(options, {
    cbu,
    amount,
    transactionId,
    secretToken,
  });

  const res = await fetch(endpoint, options);
  return res.ok;
}

// returns if ok
async function removeFunds(
  cbu: string,
  amount: string,
  transactionId: string,
  secretToken: string
): Promise<Boolean> {
  let options = {
    method: BANK_ENDPOINTS.removeFunds.method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  let endpoint = getEndpoint(cbu, BANK_ENDPOINTS.removeFunds.endpoint);

  options = addParamsToBody(options, {
    cbu,
    amount,
    transactionId,
    secretToken,
  });

  const res = await fetch(endpoint, options);
  return res.ok;
}

// returns if ok
async function endTransaction(
  cbu: string,
  transactionId: string
): Promise<Boolean> {
  let options = {
    method: BANK_ENDPOINTS.endTransaction.method,
    body: transactionId,
  };
  let endpoint = getEndpoint(cbu, BANK_ENDPOINTS.endTransaction.endpoint);

  const res = await fetch(endpoint, options);
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

export async function getBodyFromRequest(req: any) {
  const redeableStream = req.body;
  const chunks = [];
  for await (const chunk of redeableStream) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString());
}

export async function forEachMessage(
  queueName: string,
  consumer: (msg: GetMessage) => void
) {
  await (await rabbitChannelPromise).assertQueue(queueName, { durable: true });
  while (true) {
    const message = await (
      await rabbitChannelPromise
    ).get(queueName, { noAck: false });
    if (!message) {
      break;
    }
    consumer(message);
  }
  (await rabbitChannelPromise).nackAll(true);
  return;
}
