// import { Streamer } from './Streamer';
// import { STREAM_NAMES } from './constants';
const normalize = {
	update: 'updated',
	insert: 'inserted',
	remove: 'removed',
};

export default ({ Messages, Subscriptions, Rooms, Settings, Trash }) => ({
	name: 'hub',
	created() {
		const RocketChat = {
			Services: this.broker,
		};

		Messages.watch().on('change', async function({ operationType, documentKey/* , oplog*/ }) {
			switch (operationType) {
				case 'insert':
				case 'update':
					const message = await Messages.findOne(documentKey);
					// Streamer.emitWithoutBroadcast('__my_messages__', message, {});
					RocketChat.Services.broadcast('message', { action: normalize[operationType], message });
						// return Streamer.broadcast({ stream: STREA	M_NAMES['room-messages'], eventName: message.rid, args: message });
						// publishMessage(operationType, message);
			}
		});
		Subscriptions.watch().on('change', async({ operationType, documentKey }) => {
			let subscription;
			switch (operationType) {
				case 'insert':
				case 'update':
					subscription = await Subscriptions.findOne(documentKey/* , { fields }*/);
					break;

				case 'remove':
					subscription = await Trash.findOne(documentKey, { fields: { u: 1, rid: 1 } });
					break;
				default:
					return;
			}

			RocketChat.Services.broadcast('subscription', { action: normalize[operationType], subscription });
		});
		Rooms.watch().on('change', async({ operationType, documentKey }) => {
			let room;
			switch (operationType) {
				case 'insert':
				case 'update':
					room = await Rooms.findOne(documentKey/* , { fields }*/);
					break;

				case 'remove':
					room = documentKey;
					break;
				default:
					return;
			}
			// console.log(room, documentKey);
			RocketChat.Services.broadcast('room', { action: normalize[operationType], room });
			// RocketChat.Notifications.streamUser.__emit(data._id, operationType, data);
		});
		Settings.watch().on('change', async({ operationType, documentKey }) => {
			let setting;
			switch (operationType) {
				case 'insert':
				case 'update':
					setting = Settings.findOne(documentKey/* , { fields }*/);
					break;
				case 'remove':
					setting = documentKey;
					break;
				default:
					return;
			}

			RocketChat.Services.broadcast('setting', { action: normalize[operationType], setting });
			// RocketChat.Notifications.streamUser.__emit(data._id, operationType, data);
		});
	},
});
