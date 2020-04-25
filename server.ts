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

		const chatHistory = { messages: [] as any[] };

		server.post('/message', (req, res, next) => {
			const { user = null, message = '', timestamp = +new Date() } = req.body;
			const sentimentScore = sentiment.analyze(message).score;
			const chat = { user, message, timestamp, sentiment: sentimentScore };

			chatHistory.messages.push(chat);
			pusher.trigger('chat-room', 'new-message', { chat });
		});

		server.post('/messages', (req, resp, next) => {
			resp.json({ ...chatHistory, status: 'success' });
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
