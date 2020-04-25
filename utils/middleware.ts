import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

export const cors = Cors({
	methods: [ 'GET', 'POST' ],
});

export const config = {
	api: {
		bodyParser: {
			sizeLimit: '1mb',
			json: true,
			urlEncoded: true,
		},
	},
};

export function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
	return new Promise((resolve, reject) => {
		fn(req, res, (result: any) => {
			if (result instanceof Error) {
				return reject(result);
			}

			return resolve(result);
		});
	});
}
