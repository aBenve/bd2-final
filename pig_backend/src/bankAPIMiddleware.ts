import { User } from "./types.js";
import fetch, { RequestInit } from "node-fetch";
import "dotenv/config";

const POSTGRE_BANK_API = process.env.POSTGRE_BANK_API;
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

const CBU_BANK_API_REFERENCE = {
  "000": POSTGRE_BANK_API,
  "002": MONGO_BANK_API,
};

function getEndpoint(cbu: string, endpoint: string) {
  return CBU_BANK_API_REFERENCE[cbu.substring(0, 3)] + endpoint;
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
  };
  const res = await fetch(
    getEndpoint(cbu, BANK_ENDPOINTS.verifyUser.endpoint) +
      `?cbu=${cbu}` +
      `&secretToken=${token}`,
    options
  );
  return res.ok;
}

export async function authenticateUser(cbu: string, password: string) {
  const options = {
    method: BANK_ENDPOINTS.authenticateUser.method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  const res = await fetch(
    getEndpoint(cbu, BANK_ENDPOINTS.authenticateUser.endpoint) +
      `?cbu=${cbu}` +
      `&password=${password}`,
    options
  );
  return res.ok;
}

export async function iniciateTransaction(
  originCBU: string,
  originSecretToken: string,
  destinationCBU: string,
  destinationSecretToken: string,
  amount: string
): Promise<Boolean> {
  if (
    CBU_BANK_API_REFERENCE[originCBU] === CBU_BANK_API_REFERENCE[destinationCBU]
  ) {
    // Transaction inside one bank
    let options: RequestInit = {
      method: BANK_ENDPOINTS.initiateTransaction.method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Initiate Transaction with bank
    let res = await fetch(
      getEndpoint(originCBU, BANK_ENDPOINTS.initiateTransaction.endpoint) +
        `?originCbu=${originCBU}` +
        `&destinationCbu=${destinationCBU}` +
        `&amount=${amount}` +
        `&originSecretToken=${originSecretToken}` +
        `&destinationSecretToken=${destinationSecretToken}`,
      options
    );

    if (!res.ok) return false;

    const transactionId = await res.text();

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

    let res = await fetch(
      getEndpoint(originCBU, BANK_ENDPOINTS.initiateTransaction.endpoint) +
        `?originCbu=${originCBU}` +
        `&destinationCbu=${destinationCBU}` +
        `&amount=${amount}` +
        `&originSecretToken=${originSecretToken}`,
      options
    );

    if (!res.ok) {
      return false;
    }

    transactionIds.origin = (await res.json()).transactionId;

    res = await fetch(
      getEndpoint(destinationCBU, BANK_ENDPOINTS.initiateTransaction.endpoint) +
        `?originCbu=${originCBU}` +
        `&destinationCbu=${destinationCBU}` +
        `&amount=${amount}` +
        `&destinationSecretToken=${destinationSecretToken}`,
      options
    );

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
  const options = {
    method: BANK_ENDPOINTS.addFunds.method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = await fetch(
    getEndpoint(cbu, BANK_ENDPOINTS.addFunds.endpoint) +
      `?cbu=${cbu}` +
      `&amount=${amount}` +
      `&transactionId=${transactionId}`,
    options
  );
  return res.ok;
}

// returns if ok
async function removeFunds(
  cbu: string,
  amount: string,
  transactionId: string
): Promise<Boolean> {
  const options = {
    method: BANK_ENDPOINTS.removeFunds.method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = await fetch(
    getEndpoint(cbu, BANK_ENDPOINTS.removeFunds.endpoint) +
      `?cbu=${cbu}` +
      `&amount=${amount}` +
      `&transactionId=${transactionId}`,
    options
  );
  return res.ok;
}

// returns if ok
async function endTransaction(
  cbu: string,
  transactionId: string
): Promise<Boolean> {
  const options = {
    method: BANK_ENDPOINTS.endTransaction.method,
  };

  const res = await fetch(
    getEndpoint(cbu, BANK_ENDPOINTS.endTransaction.endpoint) +
      `?ctransactionIdbu=${cbu}`,
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
