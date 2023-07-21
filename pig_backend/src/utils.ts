import Pool from 'pg-pool';
import pg from 'pg';
import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { AccountWithOneIdentifier, UserPublic } from './types.js';
import { NewUserInfo } from 'types.js';

export function fromIdentifierToUserPublic(
	accountIdentifier: AccountWithOneIdentifier,
	pool: Pool<pg.Client>
): Promise<void | UserPublic> {
	const select = 'SELECT cbu, name FROM users ';
	const selectToUser = (res: pg.QueryResult<any>) => res.rows[0];
	console.log(accountIdentifier);
	try {
		if (accountIdentifier.uuid)
			return pool
				.query(select + 'WHERE uuid = $1', [accountIdentifier.uuid])
				.then(selectToUser);
		if (accountIdentifier.name)
			return pool
				.query(select + 'WHERE name = $1', [accountIdentifier.name])
				.then(selectToUser);
		if (accountIdentifier.cbu)
			return pool
				.query(select + 'WHERE cbu = $1', [accountIdentifier.cbu])
				.then(selectToUser);
		if (accountIdentifier.phone)
			return pool
				.query(select + 'WHERE phone = $1', [accountIdentifier.phone])
				.then(selectToUser);
		if (accountIdentifier.email)
			return pool
				.query(select + 'WHERE email = $1', [accountIdentifier.email])
				.then(selectToUser);
	} catch (error) {
		console.log(error);
	}
}

export function fromIdentifierToCBU(
	accountIdentifier: AccountWithOneIdentifier,
	pool: Pool<pg.Client>
): Promise<undefined | string> {
	const select = 'SELECT cbu FROM users ';
	const selectToCBU = (res: pg.QueryResult<any>) =>
		res.rows[0] ? res.rows[0].cbu : undefined;
	try {
		if (accountIdentifier.uuid)
			return pool
				.query(select + 'WHERE uuid = $1', [accountIdentifier.uuid])
				.then(selectToCBU);
		if (accountIdentifier.name)
			return pool
				.query(select + 'WHERE name = $1', [accountIdentifier.name])
				.then(selectToCBU);
		if (accountIdentifier.cbu)
			return pool
				.query(select + 'WHERE cbu = $1', [accountIdentifier.cbu])
				.then(selectToCBU);
		if (accountIdentifier.phone)
			return pool
				.query(select + 'WHERE phone = $1', [accountIdentifier.phone])
				.then(selectToCBU);
		if (accountIdentifier.email)
			return pool
				.query(select + 'WHERE email = $1', [accountIdentifier.email])
				.then(selectToCBU);
	} catch (error) {
		console.log(error);
	}
}

export function createPostgreTable(pool: Pool<pg.Client>) {
	const query = `
    CREATE TABLE IF NOT EXISTS users (
        name VARCHAR(255) NOT NULL,
        uuid UUID PRIMARY KEY,
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
		.then(res => {
			console.log('Table created successfully');
		})
		.catch(err => {
			console.log('Error creating table');
			console.error(err);
			pool.end();
		});
}

export async function createUser(
	pool: Pool<pg.Client>,
	cbu: string,
	userInfo: NewUserInfo
) {
	const uuid = uuidv4();
	const creationDate = new Date();
	const query =
		'INSERT INTO users (name, email, phone, cbu, secret_token, alias, creation_date, uuid) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *;';
	const res = await pool.query(query, [
		userInfo.name,
		userInfo.email,
		userInfo.phoneNumber,
		cbu,
		userInfo.secretToken,
		userInfo.email,
		creationDate,
		uuid,
	]);
	return res.rows[0];
}

export function addDefaultUserToDB(pool: Pool<pg.Client>) {
	const query = `
    INSERT INTO users (name, uuid, email, phone, cbu, secret_token, alias, creation_date)
    VALUES ('Juan Perez', '123e4567-e89b-12d3-a456-426614174000', 'juanperez@hotmail.com', '1234567890', '1234567890123456789012', '123456', 'Juan', '2020-01-01 00:00:00'),
    ('Taylor Swift', '123e4567-e89b-12d3-a456-426614174001', '', '1234567890', '0000000000000000000001', '7395f2b7-d338-4770-bdbf-b7d4f9043f4c', 'Taylor', '2020-01-01 00:00:00'),
    ('Carlos Menem', '123e4567-e89b-12d3-a456-426614174002', '', '1234567890', '0000000000000000000000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Turco', '2020-01-01 00:00:00') 
    ON CONFLICT DO NOTHING;

  `;
	pool.query(query).then(res => {
		console.log('Users added successfully');
	});
}
