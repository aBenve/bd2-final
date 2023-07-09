CREATE TABLE IF NOT EXISTS users (
   name VARCHAR(255) NOT NULL,
   id INT PRIMARY KEY,
   email VARCHAR(255) NOT NULL,
   phone_number CHAR(10) NOT NULL,
   balance DECIMAL(17, 2) DEFAULT 0,
   cbu CHAR(22) NOT NULL,
   password_hash VARCHAR(255) NOT NULL,
   is_blocked BOOLEAN DEFAULT false,
   secret_token UUID NOT NULL,

   CONSTRAINT cbu_unique UNIQUE (cbu),
   CONSTRAINT token_unique UNIQUE (secret_token)
);

-- INSERT INTO users VALUES ('Carlos Menem',-1,'elturco@yahoo.com.ar', '0111234567',999999999999999.99,'0000000000000000000000','',false,'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');