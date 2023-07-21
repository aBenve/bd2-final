import { Client, Pool } from "pg";

class PostgreClient {
  private pool: Pool;

  constructor() {
    try {
      this.pool = new Pool({
        host: process.env.POSTGRES_HOST, //process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || "5432"),
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
      });
      this.connect();
    } catch (err) {
      console.log("PostgreClient init failed");
      throw err;
    }
  }

  public getPool() {
    return this.pool;
  }

  private async connect() {
    await this.pool.connect();
  }
}
const pgPool = new PostgreClient().getPool();

export default pgPool;
