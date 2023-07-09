import express, { Request, Response } from "express";
import amqp from "amqplib";
import { v4 as uuidv4 } from "uuid";
import Pool from "pg-pool";
import pg from "pg";
import createPostgreTable from "./createPostgreTable.ts";
import {
  checkIfUserIsValid,
  getPrivateInfo,
  iniciateTransaction,
} from "./bankAPIMiddleware.ts";

export interface User {
  name: string;
  uuid: string;
  email: string;
  phone: string;
  cbu: string;
  secret_token: string;
  alias: string;
  creation_date: Date;
}

interface UserPublic {
  name: string;
  cbu: string;
}

interface Transaction {
  originIdentifier: AccountWithOneIdentifier;
  destinationIdentifier: AccountWithOneIdentifier;
  amount: number;
  originSecretToken: string;
  date: Date;
}

interface AccountIdentifiers {
  uuid?: string;
  name?: string;
  cbu?: string;
  phone?: string;
  email?: string;
}

type AccountWithOneIdentifier = Required<
  Pick<AccountIdentifiers, "cbu" | "email" | "name" | "phone" | "uuid">
>;

function fromIdentifierToCBU(
  accountIdentifier: AccountWithOneIdentifier,
  pool: Pool<pg.Client>
) {
  if (accountIdentifier.uuid)
    return pool
      .query("SELECT cbu FROM users WHERE uuid = $1", [accountIdentifier.uuid])
      .then((res) => res.rows[0]);
  if (accountIdentifier.name)
    return pool
      .query("SELECT cbu FROM users WHERE nombre = $1", [
        accountIdentifier.name,
      ])
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

const app = express();
const port = 3000;
let pool: Pool<pg.Client>;

while (true) {
  try {
    pool = new Pool({
      user: "usuario",
      password: "123",
      host: "localhost",
      port: 5432,
      database: "pig_backend_users",
    });
    break;
  } catch {}
}

await createPostgreTable(pool);

// await new Promise(r => setTimeout(r, 12 * 1000));
let channel: amqp.Channel;
const queueName = "transactions";
const userQueueSize = 20;
while (true) {
  try {
    const amqpConnection = await amqp.connect("amqp://localhost:5672");
    channel = await amqpConnection.createChannel();
    break;
  } catch {}
}

channel.assertQueue(queueName, { durable: true });

channel.on("error", function (err) {
  console.error("[AMQP] channel error", err.message);
});

channel.on("close", function () {
  console.log("[AMQP] channel closed");
});

app.get("/", (req: Request, res: Response) => {
  res.send(JSON.parse('{"message": "Hello Worlssdss!"}'));
});

app.get(
  "/user/",
  async (
    req: Request<AccountWithOneIdentifier>,
    res: Response<UserPublic | { error: string }>
  ) => {
    try {
      const cbu = await fromIdentifierToCBU(req.body, pool);
      if (!cbu) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(cbu.rows[0] as UserPublic);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.get(
  "/userPrivate/",
  async (
    req: Request<AccountWithOneIdentifier & { secret_token: string }>,
    res: Response<User | { error: string }>
  ) => {
    try {
      const cbu = (await fromIdentifierToCBU(req.body, pool)) as string;
      const token = req.body.secret_token;

      if (!(await checkIfUserIsValid(cbu, token))) {
        res.status(401).json({ error: "User not Valid" });
        return;
      }
      const user = await getPrivateInfo(cbu, token);
      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.post("/user", async (req: Request<{ cbu: string }>, res) => {
  try {
    const { cbu } = req.body;
    const uuid = uuidv4();
    const creation_date = new Date();
    // Ask BANK API FOR USER INFO
    const name = "Juan Perez";
    const email = "";
    const phone = "123456789";
    const secret_token = "123456789";
    const alias = "Juan Perez";

    const query = `
            INSERT INTO users (name, uuid, email, phone, cbu, secret_token, alias, creation_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
    await pool.query(query, [
      name,
      uuid,
      email,
      phone,
      cbu,
      secret_token,
      alias,
      creation_date,
    ]);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/makeTransaction", async (req: Request<Transaction>, res) => {
  try {
    const originCBU = await fromIdentifierToCBU(
      req.body.originIdentifier,
      pool
    );
    const destinationCBU = await fromIdentifierToCBU(
      req.body.destinationIdentifier,
      pool
    );
    const userQueueName = originCBU + "-transactions";
    channel.assertQueue(userQueueName, { durable: true });

    if (iniciateTransaction(originCBU, destinationCBU, req.body.amount)) {
      const msg = {
        originCBU,
        destinationCBU,
        amount: req.body.amount,
        date: new Date(),
      };
      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)), {
        persistent: true,
      });
      channel.sendToQueue(userQueueName, Buffer.from(JSON.stringify(msg)), {
        persistent: true,
      });
      res.status(200).json({ message: "Transaction successful" });
    }

    res
      .status(500)
      .json({ error: "Internal Server Error Making The Transaction" });
  } catch (error) {
    console.error("Error making transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// The transactions are stored in the rabbitmq queue
app.get(
  "/transactions",
  async (
    req: Request<AccountWithOneIdentifier & { secret_token: string }>,
    res: Response<{ transactions: Transaction[] } | { error: string }>
  ) => {
    try {
      const cbu = await fromIdentifierToCBU(req.body, pool);
      const token = req.body.secret_token;

      if (!cbu) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const userQueueName = cbu + "-transactions";

      if (!(await checkIfUserIsValid(cbu, token))) {
        return res.status(404).json({ error: "User not valid" });
      }
      const userQueueSize = await channel.checkQueue(userQueueName);
      const toRes = {
        transactions: [],
      };
      Array(userQueueSize).forEach(() => {
        channel.consume(
          userQueueName,
          (msg) => {
            if (msg !== null) {
              console.log(msg.content.toString()); // TODO: SACAR
              toRes.transactions.push(
                JSON.parse(msg.content.toString()) as Transaction
              );
            }
          },
          { noAck: true }
        );
      });
      // PARA EVITAR QUE SE BORREN LOS MENSAJES DE LA COLA
      channel.cancel(userQueueName);

      return res.status(200).json(toRes);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.get(
  "/recentContacts",
  async (
    req: Request<AccountWithOneIdentifier & { secret_token: string }>,
    res: Response<{ contacts: UserPublic[] } | { error: string }>
  ) => {
    try {
      const cbu = await fromIdentifierToCBU(req.body, pool);
      const token = req.body.secret_token;

      if (!(await checkIfUserIsValid(cbu, token))) {
        res.status(404).json({ error: "User not valid" });
        return;
      }

      const userQueueName = cbu + "-transactions";
      const toRes = {
        contacts: [],
      };
      Array(userQueueSize).forEach(() => {
        channel.consume(
          userQueueName,
          (msg) => {
            if (msg !== null) {
              const transaction = JSON.parse(msg.content.toString());
              if (transaction.originCBU === cbu) {
                toRes.contacts.push(transaction.destinationIdentifier);
              } else {
                toRes.contacts.push(transaction.originIdentifier);
              }
            }
          },
          { noAck: true }
        );
      });
      // PARA EVITAR QUE SE BORREN LOS MENSAJES DE LA COLA
      channel.cancel(userQueueName);

      return res.status(200).json(toRes);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
