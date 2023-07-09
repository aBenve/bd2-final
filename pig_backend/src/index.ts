import express, { Request, Response } from "express";
import amqp from "amqplib";
import { v4 as uuidv4 } from "uuid";
import Pool from "pg-pool";
import pg from "pg";
import createPostgreTable from "./createPostgreTable.ts";

interface User {
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
    return pool.query("SELECT cbu FROM users WHERE uuid = $1", [
      accountIdentifier.uuid,
    ]);
  if (accountIdentifier.name)
    return pool.query("SELECT cbu FROM users WHERE nombre = $1", [
      accountIdentifier.name,
    ]);
  if (accountIdentifier.cbu)
    return pool.query("SELECT cbu FROM users WHERE cbu = $1", [
      accountIdentifier.cbu,
    ]);
  if (accountIdentifier.phone)
    return pool.query("SELECT cbu FROM users WHERE phone = $1", [
      accountIdentifier.phone,
    ]);
  if (accountIdentifier.email)
    return pool.query("SELECT cbu FROM users WHERE email = $1", [
      accountIdentifier.email,
    ]);
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

createPostgreTable(pool);

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
      const result = await fromIdentifierToCBU(req.body, pool);
      res.json(result.rows[0] as UserPublic);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.get(
  "/user-private/",
  async (
    req: Request<AccountWithOneIdentifier & { secret_token: string }>,
    res: Response<User | { error: string }>
  ) => {
    try {
      const cbu = await fromIdentifierToCBU(req.body, pool);
      const token = req.body.secret_token;
      // Ask BANK API FOR USER PRIVATE INFO
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

app.post("/make-transaction", async (req: Request<Transaction>, res) => {
  const originCBU = await fromIdentifierToCBU(req.body.originIdentifier, pool);
  const destinationCBU = await fromIdentifierToCBU(
    req.body.destinationIdentifier,
    pool
  );
  const userQueueName = originCBU + "-transactions";
  channel.assertQueue(userQueueName, { durable: true });
  // ADD TRANSACTION TO USERQUEUE AND GLOBAL QUEUE

  // CHECK IF BOTH CBU EXISTS WITH THE BANKS
  // ASK BANK API FOR TRANSACTION
  // IF TRANSACTION IS SUCCESSFUL
  // SEND TRANSACTION TO RABBITMQ
  //channel.sendToQueue(queuename, Buffer.from(msg), {persistent: true});

  // ELSE
  // RETURN ERROR
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

      const userQueueName = cbu + "-transactions";
      // ASK BANK API IF USER IS VALID
      // IF USER IS VALID
      // ASK RABBITMQ FOR TRANSACTIONS
      const userQueueSize = await channel.checkQueue(userQueueName);
      const res = {
        transactions: [],
      };
      Array(userQueueSize).forEach(() => {
        channel.consume(
          userQueueName,
          (msg) => {
            if (msg !== null) {
              console.log(msg.content.toString()); // TODO: SACAR
              res.transactions.push(
                JSON.parse(msg.content.toString()) as Transaction
              );
            }
          },
          { noAck: true }
        );
      });
      // PARA EVITAR QUE SE BORREN LOS MENSAJES DE LA COLA
      channel.cancel(userQueueName);

      // ELSE
      // RETURN ERROR
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
    return res;
  }
);

app.get(
  "/recent-contacts",
  async (
    req: Request<AccountWithOneIdentifier & { secret_token: string }>,
    res: Response<{ contacts: UserPublic[] } | { error: string }>
  ) => {
    try {
      const cbu = await fromIdentifierToCBU(req.body, pool);
      const token = req.body.secret_token;
      // ASK BANK API IF USER IS VALID
      // IF USER IS VALID
      // ASK RABBITMQ FOR TRANSACTIONS
      const userQueueName = cbu + "-transactions";
      const res = {
        contacts: [],
      };
      Array(userQueueSize).forEach(() => {
        channel.consume(
          userQueueName,
          (msg) => {
            if (msg !== null) {
              const transaction = JSON.parse(msg.content.toString());
              if (transaction.originCBU === cbu) {
                res.contacts.push(transaction.destinationIdentifier);
              } else {
                res.contacts.push(transaction.originIdentifier);
              }
            }
          },
          { noAck: true }
        );
      });
      // PARA EVITAR QUE SE BORREN LOS MENSAJES DE LA COLA
      channel.cancel(userQueueName);
      // ELSE
      // RETURN ERROR
      return res;
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
