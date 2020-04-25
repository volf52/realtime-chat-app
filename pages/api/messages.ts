import { config as apiConfig, runMiddleware, cors } from '../../utils/middleware';
// @ts-ignore
import Sentiment from 'sentiment';
import { NextApiHandler } from 'next';
import Pusher from 'pusher';

const sentiment = new Sentiment();
const chatHistory = {
	messages: [] as any[],
};

const pusher = new Pusher({
	appId: process.env.PUSHER_APP_ID as string,
	key: process.env.PUSHER_APP_KEY as string,
	secret: process.env.PUSHER_APP_SECRET as string,
	cluster: process.env.PUSHER_APP_CLUSTER as string,
	useTLS: true,
});

export const config = {
	...apiConfig,
};

const handler: NextApiHandler = async function(req, resp) {
	await runMiddleware(req, resp, cors);
	if (req.method === 'GET') {
		return resp.status(200).json({ ...chatHistory, status: 'success' });
	} else if (req.method === 'POST') {
		const { user = null, message = '', timestamp = +new Date() } = req.body;
		const sentimentScore = sentiment.analyze(message).score;
		const chat = { user, message, timestamp, sentiment: sentimentScore };

		chatHistory.messages.push(chat);
		pusher.trigger('chat-room', 'new-message', { chat });
	} else {
		throw new Error('Undefined method for api');
	}
};

export default handler;
