import { GetMessage } from "amqplib";
import { rabbitChannel } from "../service/rabbitmq";
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
  addFunds: { endpoint: "/addFunds", method: "POST" },
  removeFunds: { endpoint: "/removeFunds", method: "POST" },
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

function addParamsToBody(
  options: RequestInit,
  params: {
    cbu?: string;
    password?: string;
    originCBU?: string;
    destinationCBU?: string;
    amount?: string;
    originSecretToken?: string;
    destinationSecretToken?: string;
    transactionId?: string;
  }
) {
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
  amount: string
): Promise<Boolean> {
  if (
    CBU_BANK_API_REFERENCE[originCBU as keyof CBU_BANK_API_REFERENCE] ===
    CBU_BANK_API_REFERENCE[destinationCBU as keyof CBU_BANK_API_REFERENCE]
  ) {
    // Transaction inside one bank
    let options: RequestInit = {
      method: BANK_ENDPOINTS.initiateTransaction.method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    let endpoint = getEndpoint(
      originCBU,
      BANK_ENDPOINTS.initiateTransaction.endpoint
    );

    if (BANK_ENDPOINTS.initiateTransaction.method != "GET") {
      options = addParamsToBody(options, {
        originCBU,
        destinationCBU,
        amount,
        originSecretToken,
        destinationSecretToken,
      });
    } else {
      endpoint = addParamsToRequest(endpoint, [
        { name: "originCBU", value: originCBU },
        { name: "destinationCBU", value: destinationCBU },
        { name: "amount", value: amount },
        { name: "originSecretToken", value: originSecretToken },
        { name: "destinationSecretToken", value: destinationSecretToken },
      ]);
    }

    // Initiate Transaction with bank
    let res = await fetch(endpoint, options);

    if (!res.ok) {
      console.log("No init");
      return false;
    }

    const transactionId = await res.text();

    console.log("Transaction Id: ", transactionId);

    // Add and remove funds

    if (!(await removeFunds(originCBU, amount, transactionId))) {
      await endTransaction(originCBU, transactionId);
      return false;
    }

    if (!(await addFunds(destinationCBU, amount, transactionId))) {
      if (!(await addFunds(originCBU, amount, transactionId))) {
        console.error(
          `ERROR: Transaction failed, ${amount} has been taken from ${originCBU} and could not be returned.`
        );
        return false;
      }
      if (!(await endTransaction(originCBU, transactionId))) {
        console.error(
          `ERROR: All balances are ok but transaction could not be ended for ${originCBU}`
        );
      }
      return false;
    }

    // Signal end of transaction
    return await endTransaction(originCBU, transactionId);
  } else {
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

    if (BANK_ENDPOINTS.initiateTransaction.method != "GET") {
      options = addParamsToBody(options, {
        originCBU,
        destinationCBU,
        amount,
        originSecretToken,
      });
    } else {
      initTransactionEndpoint = addParamsToRequest(initTransactionEndpoint, [
        { name: "originCBU", value: originCBU },
        { name: "destinationCBU", value: destinationCBU },
        { name: "amount", value: amount },
        { name: "originSecretToken", value: originSecretToken },
      ]);
    }

    let res = await fetch(initTransactionEndpoint, options);

    if (!res.ok) {
      return false;
    }

    transactionIds.origin = (await res.json()).transactionId;

    options = {
      method: BANK_ENDPOINTS.initiateTransaction.method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    initTransactionEndpoint = getEndpoint(
      originCBU,
      BANK_ENDPOINTS.initiateTransaction.endpoint
    );
    if (BANK_ENDPOINTS.initiateTransaction.method != "GET") {
      options = addParamsToBody(options, {
        originCBU,
        destinationCBU,
        amount,
        destinationSecretToken,
      });
    } else {
      initTransactionEndpoint = addParamsToRequest(initTransactionEndpoint, [
        { name: "originCBU", value: originCBU },
        { name: "destinationCBU", value: destinationCBU },
        { name: "amount", value: amount },
        { name: "destinationSecretToken", value: destinationSecretToken },
      ]);
    }

    res = await fetch(initTransactionEndpoint, options);

    if (!res.ok) {
      return false;
    }

    transactionIds.destination = (await res.json()).transactionId;

    const endTransactions = async () => {
      const allOk = await Promise.all([
        endTransaction(originCBU, transactionIds.origin),
        endTransaction(destinationCBU, transactionIds.destination),
      ]);
      return !allOk.includes(false);
    };

    // Add and remove funds
    if (!(await removeFunds(originCBU, amount, transactionIds.origin))) {
      if (!(await endTransactions())) {
        console.error(
          `ERROR: transaction could not be finished for transactions ${transactionIds}`
        );
      }
      return false;
    }

    if (!(await addFunds(destinationCBU, amount, transactionIds.destination))) {
      if (!(await addFunds(originCBU, amount, transactionIds.origin))) {
        console.error(
          `ERROR: Funds (${amount}) were removed from ${originCBU} but could not be returned after failure.`
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
}

// returns if ok
async function addFunds(
  cbu: string,
  amount: string,
  transactionId: string
): Promise<Boolean> {
  let options = {
    method: BANK_ENDPOINTS.addFunds.method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  let endpoint = getEndpoint(cbu, BANK_ENDPOINTS.addFunds.endpoint);

  if (BANK_ENDPOINTS.removeFunds.method != "GET") {
    options = addParamsToBody(options, {
      cbu,
      amount,
      transactionId,
    });
  } else {
    endpoint = addParamsToRequest(endpoint, [
      { name: "cbu", value: cbu },
      { name: "amount", value: amount },
      { name: "transactionId", value: transactionId },
    ]);
  }

  const res = await fetch(endpoint, options);
  return res.ok;
}

// returns if ok
async function removeFunds(
  cbu: string,
  amount: string,
  transactionId: string
): Promise<Boolean> {
  let options = {
    method: BANK_ENDPOINTS.removeFunds.method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  let endpoint = getEndpoint(cbu, BANK_ENDPOINTS.removeFunds.endpoint);

  if (BANK_ENDPOINTS.removeFunds.method != "GET") {
    options = addParamsToBody(options, {
      cbu,
      amount,
      transactionId,
    });
  } else {
    endpoint = addParamsToRequest(endpoint, [
      { name: "cbu", value: cbu },
      { name: "amount", value: amount },
      { name: "transactionId", value: transactionId },
    ]);
  }

  const res = await fetch(
    getEndpoint(cbu, BANK_ENDPOINTS.removeFunds.endpoint),
    options
  );
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
  rabbitChannel.assertQueue(queueName, { durable: true });
  while (true) {
    const message = await rabbitChannel.get(queueName, { noAck: false });
    if (!message) {
      break;
    }
    consumer(message);
  }
  rabbitChannel.nackAll(true);
  return;
}
