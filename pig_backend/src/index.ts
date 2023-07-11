import express, { Request, Response } from "express";
import amqp from "amqplib";
import { v4 as uuidv4 } from "uuid";
import Pool from "pg-pool";
import pg from "pg";
import {
  checkIfUserIsValid,
  getPrivateInfo,
  iniciateTransaction,
} from "./bankAPIMiddleware.js";
import {
  AccountWithOneIdentifier,
  Transaction,
  User,
  UserPublic,
} from "./types.js";
import {
  createPostgreTable,
  addUserToDB,
  fromIdentifierToCBU,
  connectToPostgre,
  connectToRabit,
} from "./utils.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 3000;
let pool: Pool<pg.Client>;

connectToPostgre(pool);

createPostgreTable(pool);
addUserToDB(pool);

// await new Promise(r => setTimeout(r, 12 * 1000));
let channel: amqp.Channel;

const queueName = "transactions";
const userQueueSize = 20;

connectToRabit(channel);
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
      const cbu = await fromIdentifierToCBU(req.body, pool); // TODO: change to add all public information
      if (!cbu) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(cbu as UserPublic);
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
      "",
      creation_date,
    ]);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/makeTransaction", async (req: Request<Transaction>, res) => {
  try {
    const originCBU = (
      await fromIdentifierToCBU(req.body.originIdentifier, pool)
    ).cbu;
    const destinationCBU = (
      await fromIdentifierToCBU(req.body.destinationIdentifier, pool)
    ).cbu;
    const userQueueName = originCBU + "-transactions";
    channel.assertQueue(userQueueName, { durable: true });

    const originToken = (
      await pool.query("SELECT secret_token FROM users WHERE cbu = $1", [
        originCBU,
      ])
    ).rows[0].secret_token;

    const destinationToken = (
      await pool.query("SELECT secret_token FROM users WHERE cbu = $1", [
        destinationCBU,
      ])
    ).rows[0].secret_token;

    if (
      iniciateTransaction(
        originCBU,
        originToken,
        destinationCBU,
        destinationToken,
        req.body.amount
      )
    ) {
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
    } else {
      res
        .status(500)
        .json({ error: "Internal Server Error Making The Transaction" });
    }
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
      const cbu = (await fromIdentifierToCBU(req.body, pool)).cbu;
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
