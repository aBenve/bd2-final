import express, { Request, Response, request } from 'express';
import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import Pool from 'pg-pool';
import createPostgreTable from './createPostgreTable.ts';
import fetch from 'node-fetch';

const app = express();
const port = 3000;
var pool;

while (true) {
	try {
		pool = new Pool({
			user: 'usuario',
			password: '123',
			host: 'postgres',
			port: 5432,
			database: 'pig_backend_users',
		});
		break;
	} catch {}
}

createPostgreTable(pool);

// await new Promise(r => setTimeout(r, 12 * 1000));
while (true) {
	try {
		const amqpConnection = await amqp.connect('amqp://rabbitmq:5672');
		const channel = await amqpConnection.createChannel();
		break;
	} catch {}
}
app.get('/', (req: Request, res: Response) => {
	res.send(JSON.parse('{"message": "Hello Worlssdss!"}'));
});

app.post('/users', async (req, res) => {
	try {
		const { nombre, email, phone, cbu, secret_token, alias } = req.body;
		const uuid = uuidv4();
		const creation_date = new Date();
		const query = `
            INSERT INTO users (nombre, uuid, email, phone, cbu, secret_token, alias, creation_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
		await pool.query(query, [
			nombre,
			uuid,
			email,
			phone,
			cbu,
			secret_token,
			alias,
			creation_date,
		]);
	} catch (error) {
		console.error('Error creating user:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.get('/users', async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM users');
		res.json(result.rows);
	} catch (error) {
		console.error('Error fetching users:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
