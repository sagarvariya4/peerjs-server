import { MessageType } from "../enums.ts";
import {
	HeartbeatHandler,
	TransmissionHandler,
	ListPeersHandler,
	SetMetadataHandler,
} from "./handlers/index.ts";
import type { IHandlersRegistry } from "./handlersRegistry.ts";
import { HandlersRegistry } from "./handlersRegistry.ts";
import type { IClient } from "../models/client.ts";
import type { IMessage } from "../models/message.ts";
import type { IRealm } from "../models/realm.ts";
import type { Handler } from "./handler.ts";

export interface IMessageHandler {
	handle(client: IClient | undefined, message: IMessage): boolean;
}

export class MessageHandler implements IMessageHandler {
	constructor(
		realm: IRealm,
		private readonly handlersRegistry: IHandlersRegistry = new HandlersRegistry(),
	) {
		const transmissionHandler: Handler = TransmissionHandler({ realm });
		const heartbeatHandler: Handler = HeartbeatHandler;
		const listPeersHandler: Handler = ListPeersHandler({ realm });
		const setMetadataHandler: Handler = SetMetadataHandler({ realm });

		const handleTransmission: Handler = (
			client: IClient | undefined,
			{ type, src, dst, payload }: IMessage,
		): boolean => {
			return transmissionHandler(client, {
				type,
				src,
				dst,
				payload,
			});
		};

		const handleHeartbeat = (client: IClient | undefined, message: IMessage) =>
			heartbeatHandler(client, message);

		const handleListPeers = (client: IClient | undefined, message: IMessage) =>
			listPeersHandler(client, message);

		const handleSetMetadata = (
			client: IClient | undefined,
			message: IMessage,
		) => setMetadataHandler(client, message);

		this.handlersRegistry.registerHandler(
			MessageType.HEARTBEAT,
			handleHeartbeat,
		);
		this.handlersRegistry.registerHandler(
			MessageType.OFFER,
			handleTransmission,
		);
		this.handlersRegistry.registerHandler(
			MessageType.ANSWER,
			handleTransmission,
		);
		this.handlersRegistry.registerHandler(
			MessageType.CANDIDATE,
			handleTransmission,
		);
		this.handlersRegistry.registerHandler(
			MessageType.LEAVE,
			handleTransmission,
		);
		this.handlersRegistry.registerHandler(
			MessageType.EXPIRE,
			handleTransmission,
		);
		// RELAY reuses the exact same dst-based forwarding as OFFER/ANSWER/
		// CANDIDATE: client sends { type: 'RELAY', dst: targetPeerId, payload },
		// and the server hands the payload straight to that peer's socket —
		// no WebRTC connection required.
		this.handlersRegistry.registerHandler(
			MessageType.RELAY,
			handleTransmission,
		);
		this.handlersRegistry.registerHandler(
			MessageType.LIST_PEERS,
			handleListPeers,
		);
		this.handlersRegistry.registerHandler(
			MessageType.SET_METADATA,
			handleSetMetadata,
		);
	}

	public handle(client: IClient | undefined, message: IMessage): boolean {
		return this.handlersRegistry.handle(client, message);
	}
}
