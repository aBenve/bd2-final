import Pool from "pg-pool";
import pg from "pg";

export default function createPostgreTable(pool: Pool<pg.Client>) {
  const query = `
    CREATE TABLE users (
        nombre VARCHAR(255) NOT NULL,
        uuid TEXT(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        phone TEXT(10) NOT NULL,
        cbu TEXT(22) NOT NULL,
        secret_token VARCHAR(255) NOT NULL,
        alias VARCHAR(20) NOT NULL,
        creation_date TIMESTAMP NOT NULL,
    
        CONSTRAINT cbu_unique UNIQUE (cbu)
    );`;
  pool
    .query(query)
    .then((res) => {
      console.log("Table created successfully");
      pool.end();
    })
    .catch((err) => {
      console.error(err);
      pool.end();
    });
}
