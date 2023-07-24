import { Client } from "pg";

class PostgreClient {
  private client: Client | null = null;

  constructor() {
    if (globalPostgre.client) return;

    try {
      this.client = new Client({
        host: process.env.POSTGRES_HOST, //process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || "5432"),
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
      });

      this.client.connect(
        (err) => err && console.log("PostgreClient connect failed")
      );

      this.init();

      console.log("PostgreClient init success");
    } catch (err) {
      console.log("PostgreClient init failed");
      throw err;
    }
  }

  public getClient() {
    return this.client!;
  }

  public init() {
    this.initTable();
    this.addUser();
  }

  private addUser() {
    this.client
      ?.query(
        `
      INSERT INTO users (name, uuid, email, phone, cbu, secret_token, alias, creation_date)
      VALUES ('Juan Perez', '123e4567-e89b-12d3-a456-426614174000', 'juanperez@hotmail.com', '1234567890', '1234567890123456789012', '123456', 'Juan', '2020-01-01 00:00:00'),
      ('Taylor Swift', '123e4567-e89b-12d3-a456-426614174001', '', '1234567890', '0000000000000000000001', '7395f2b7-d338-4770-bdbf-b7d4f9043f4c', 'Taylor', '2020-01-01 00:00:00'),
      ('Carlos Menem', '123e4567-e89b-12d3-a456-426614174002', '', '1234567890', '0000000000000000000000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Turco', '2020-01-01 00:00:00') 
      ON CONFLICT DO NOTHING;
    `
      )
      .then((res) => {
        console.log("User added successfully");
      })
      .catch((err) => {
        console.log("Error adding user");
        console.error(err);
      });
  }

  private initTable() {
    this.client
      ?.query(
        `
    CREATE TABLE IF NOT EXISTS users (
        name VARCHAR(255) NOT NULL,
        uuid UUID PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        phone CHAR(10) NOT NULL,
        cbu CHAR(22) NOT NULL,
        secret_token VARCHAR(255) NOT NULL,
        alias VARCHAR(20) NOT NULL,
        creation_date TIMESTAMP NOT NULL,
    
        CONSTRAINT cbu_unique UNIQUE (cbu),
        CONSTRAINT email_unique UNIQUE (email),
        CONSTRAINT phone_unique UNIQUE (phone)

    );`
      )
      .then((res) => {
        console.log("Table created successfully");
      })
      .catch((err) => {
        console.log("Error creating table");
        console.error(err);
        // this.client?.end();
      });
  }
}
const globalPostgre = globalThis as unknown as {
  client: Client | undefined;
};

const preparedClient = new PostgreClient();

const client = globalPostgre.client ?? preparedClient.getClient();
//console.log("client", client);

export default client;

globalPostgre.client = client;
