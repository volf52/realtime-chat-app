import cors from 'cors';
import next from 'next';
import Pusher from 'pusher';
import express from 'express';
import bodyParser from 'body-parser';
// @ts-ignore
import Sentiment from 'sentiment';

const dotenv = require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT as string) || 3000;

const app = next({ dev });
const handler = app.getRequestHandler();
const sentiment = new Sentiment();

const pusher = new Pusher({
	appId: process.env.PUSHER_APP_ID as string,
	key: process.env.PUSHER_APP_KEY as string,
	secret: process.env.PUSHER_APP_SECRET as string,
	cluster: process.env.PUSHER_APP_CLUSTER as string,
	useTLS: true,
});

app
	.prepare()
	.then(() => {
		const server = express();

		// @ts-ignore
		server.use(cors());
		server.use(bodyParser.json());
		server.use(bodyParser.urlencoded({ extended: true }));

		server.get('*', (req, res) => {
			return handler(req, res);
		});

		server.listen(3000, (err: any) => {
			if (err) throw err;
			console.log(`> Ready on http://localhost:${port}`);
		});
	})
	.catch((ex) => {
		console.error(ex.stack);
		process.exit(1);
	});
