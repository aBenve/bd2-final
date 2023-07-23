import express, { Request, Response } from "express";
import amqp from "amqplib";
import { v4 as uuidv4 } from "uuid";
import Pool from "pg-pool";
import pg from "pg";
import {
  authenticateUser,
  checkIfUserExists,
  checkIfUserIsValid,
  getPrivateInfo,
  iniciateTransaction,
} from "./bankAPIMiddleware.js";
import {
  AccountWithOneIdentifier,
  QueueTransaction,
  Transaction,
  User,
  UserPublic,
} from "./types.js";
import {
  createPostgreTable,
  addDefaultUserToDB,
  fromIdentifierToCBU,
  createUser,
  fromIdentifierToUserPublic,
} from "./utils.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 3000;
let pool: Pool<pg.Client>;

while (true) {
  try {
    pool = new Pool({
      user: "usuario",
      password: "123",
      host: "localhost",
      port: 5431,
      database: "pig_backend_users",
    });
    break;
  } catch {}
}
createPostgreTable(pool);
addDefaultUserToDB(pool);

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

console.log("Connected to RabbitMQ");
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
  "/users/",
  async (
    req: Request<void>,
    res: Response<UserPublic[] | { error: string }>
  ) => {
    try {
      const users = await pool.query("SELECT * from users").then((r) => r.rows);
      res.status(200).json(users as UserPublic[]);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Checked
app.get(
  "/user/",
  async (
    req: Request<AccountWithOneIdentifier>,
    res: Response<UserPublic | { error: string }>
  ) => {
    try {
      const user = await fromIdentifierToUserPublic(req.body, pool); // TODO: change to add all public information
      console.log(user);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user as UserPublic);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Checked
app.get(
  "/userPrivate/",
  async (
    req: Request<AccountWithOneIdentifier & { secret_token: string }>,
    res: Response<User | { error: string }>
  ) => {
    try {
      const cbu = await fromIdentifierToCBU(req.body, pool);
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

// Checked
app.post(
  "/user",
  async (
    req: Request<{ cbu: string }>,
    res: Response<User | { error: string }>
  ) => {
    try {
      const { cbu, password } = req.body;
      if ((await fromIdentifierToCBU(cbu, pool)) != undefined) {
        res.status(400).json({ error: "User already exists" });
        return;
      }
      const newUserInfo = await authenticateUser(cbu, password);

      const body = await createUser(pool, cbu, newUserInfo);
      res.status(200).json(body);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Checked
app.post("/makeTransaction", async (req: Request<Transaction>, res) => {
  try {
    const originCBU =
      (await fromIdentifierToCBU(req.body.originIdentifier, pool)) ??
      "Not Found";

    const destinationCBU =
      (await fromIdentifierToCBU(req.body.destinationIdentifier, pool)) ??
      "Not Found";

    if (originCBU === "Not Found") {
      if (destinationCBU === "Not Found") {
        res
          .status(404)
          .json({ error: "Origin and Destination users not found" });
        return;
      }
      res.status(404).json({ error: "Origin user not found" });
      return;
    }
    if (destinationCBU === "Not Found") {
      res.status(404).json({ error: "Destination user not found" });
      return;
    }

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
      await iniciateTransaction(
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
        balance: req.body.amount,
        date: new Date(),
      } as QueueTransaction;
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
      const cbu = (await fromIdentifierToCBU(req.body, pool))!;
      const token = req.body.secret_token;

      if (!cbu) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const userQueueName = cbu + "-transactions";

      if (!(await checkIfUserIsValid(cbu, token))) {
        return res.status(404).json({ error: "User not valid" });
      }
      // const userQueueSize = await channel.checkQueue(userQueueName);
      const toRes = {
        transactions: [],
      };

      await forEachMessage(userQueueName, (message) =>
        toRes.transactions.push(
          JSON.parse(message.content.toString()) as QueueTransaction
        )
      );

      return res.status(200).json(toRes);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Checked
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
        contacts: new Set<string>(),
      };

      await forEachMessage(userQueueName, (message) => {
        const transaction: QueueTransaction = JSON.parse(
          message.content.toString()
        );
        if (transaction.originCBU === cbu) {
          toRes.contacts.add(transaction.destinationCBU);
        } else {
          toRes.contacts.add(transaction.originCBU);
        }
      });

      const response: { contacts: UserPublic[] } = {
        contacts: [],
      };

      const it = toRes.contacts.values();
      while (true) {
        const contactCBU = it.next();

        if (contactCBU.done) {
          break;
        }
        const user = await fromIdentifierToUserPublic(
          { cbu: contactCBU.value } as AccountWithOneIdentifier,
          pool
        );
        if (user) {
          response.contacts.push(user);
        }
      }

      return res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
