import Pool from "pg-pool";
import pg from "pg";

export function createPostgreTable(pool: Pool<pg.Client>) {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
        nombre VARCHAR(255) NOT NULL,
        uuid CHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        phone CHAR(10) NOT NULL,
        cbu CHAR(22) NOT NULL,
        secret_token VARCHAR(255) NOT NULL,
        alias VARCHAR(20) NOT NULL,
        creation_date TIMESTAMP NOT NULL,
    
        CONSTRAINT cbu_unique UNIQUE (cbu)
    );`;
  pool
    .query(query)
    .then((res) => {
      console.log("Table created successfully");
    })
    .catch((err) => {
      console.log("Error creating table");
      console.error(err);
      pool.end();
    });
}

export function addUserToDB(pool: Pool<pg.Client>) {
  const query = `
    INSERT INTO users (nombre, uuid, email, phone, cbu, secret_token, alias, creation_date)
    VALUES ('Juan Perez', '123e4567-e89b-12d3-a456-426614174000', "", '1234567890', '1234567890123456789012', '123456', 'Juan', '2020-01-01 00:00:00');
  `;
  pool.query(query);
}
