import { MessageType } from "../../../enums.ts";
import type { IClient } from "../../../models/client.ts";
import type { IMessage } from "../../../models/message.ts";
import type { IRoomRegistry } from "../../../models/roomRegistry.ts";

export const ListPeersHandler = ({
	roomRegistry,
}: {
	roomRegistry: IRoomRegistry;
}): ((client: IClient | undefined, message: IMessage) => boolean) => {
	return (client: IClient | undefined): boolean => {
		if (!client) return false;

		const peers = roomRegistry.getPeersInRoom(
			client.getPathname(),
			client.getId(),
		);

		client.send({
			type: MessageType.PEERS_LIST,
			payload: peers.map((peer) => ({
				peerId: peer.getId(),
				metadata: peer.getMetadata(),
			})),
		});

		return true;
	};
};
