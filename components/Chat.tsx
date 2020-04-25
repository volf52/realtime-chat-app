import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';

import ChatMessage from './ChatMessage';

const SAD_EMOJI = [ 55357, 56864 ];
const HAPPY_EMOJI = [ 55357, 56832 ];
const NEUTRAL_EMOJI = [ 55357, 56848 ];

interface ChatProps {
	activeUser: any;
}

type ChatType = {
	user: any;
	message: string;
	timestamp: number;
	sentiment: number;
};

const Chat: React.FC<ChatProps> = (props) => {
	const [ chats, setChats ] = useState<ChatType[]>([]);
	// let pusher = null;
	const pusher = new Pusher(process.env.PUSHER_APP_KEY as string, {
		cluster: process.env.PUSHER_APP_CLUSTER,
		encrypted: true,
	});
	let channel = null;

	useEffect(() => {
		channel = pusher.subscribe('chat-room');
		channel.bind('new-message', ({ chat = null }) => {
			const newChats = [ ...chats ];
			// @ts-ignore
			chat && chats.push(chat);
			setChats(newChats);
		});
		pusher.connection.bind('connected', () => {
			axios.post('/messages').then((resp) => {
				const newChats = resp.data.messages as ChatType[];
				setChats(newChats);
			});
		});

		return () => {
			pusher.disconnect();
		};
	});

	const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		const val = e.currentTarget.value;

		if (e.keyCode === 13 && !e.shiftKey) {
			const { activeUser: user } = props;
			const chat = { user, message: val, timestamp: +new Date() };

			e.currentTarget.value = '';
			axios.post('/message', chat);
		}
	};

	return (
		props.activeUser && (
			<Fragment>
				<div
					className="border-bottom border-gray w-100 d-flex align-items-center bg-white"
					style={{ height: 90 }}
				>
					<h2 className="text-dark mbb-0 mx-4 px-2">{props.activeUser}</h2>
				</div>

				<div
					className="px-4 pb-4 w-100 d-flex flex-row flex-wrap align-items-start align-content-start position-relative"
					style={{ height: 'calc(100% - 180px)', overflowY: 'scroll' }}
				>
					{chats.map((chat, index) => {
						const previous = Math.max(0, index - 1);
						const previousChat = chats[previous];
						const position = chat.user === props.activeUser ? 'right' : 'left';

						const isFirst = previous === index;
						const inSequence = chat.user === previousChat.user;
						const hasDelay = Math.ceil((chat.timestamp - previousChat.timestamp) / (1000 * 60)) > 1;

						const mood =
							chat.sentiment > 0 ? HAPPY_EMOJI : chat.sentiment === 0 ? NEUTRAL_EMOJI : SAD_EMOJI;

						return (
							<Fragment key={index}>
								{(isFirst || !inSequence || hasDelay) && (
									<div
										className={`d-block w-100 font-weight-bold text-dark mt-4 pb-1 px-1 text-${position}`}
										style={{ fontSize: '0.9rem' }}
									>
										<span className="d-block" style={{ fontSize: '1.6rem' }}>
											{String.fromCodePoint(...mood)}
										</span>
										<span>{chat.user || 'Anonymous'}</span>
									</div>
								)}

								<ChatMessage message={chat.message} position={position} />
							</Fragment>
						);
					})}
				</div>

				<div
					className="border-top border-gray w-100 px-4 d-flex align-items-center bg-light"
					style={{ minHeight: 90 }}
				>
					<textarea
						className="form-control px-3 py-2"
						onKeyUp={handleKeyUp}
						placeholder="Enter a chat message..."
						style={{ resize: 'none' }}
					/>
				</div>
			</Fragment>
		)
	);
};

export default Chat;
