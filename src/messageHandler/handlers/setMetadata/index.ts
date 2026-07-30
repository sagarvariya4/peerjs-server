import { MessageType } from "../../../enums.ts";
import type { IClient } from "../../../models/client.ts";
import type { IMessage } from "../../../models/message.ts";
import type { IRoomRegistry } from "../../../models/roomRegistry.ts";

export const SetMetadataHandler = ({
	roomRegistry,
}: {
	roomRegistry: IRoomRegistry;
}): ((client: IClient | undefined, message: IMessage) => boolean) => {
	return (client: IClient | undefined, message: IMessage): boolean => {
		if (!client) return false;

		const metadata = (message.payload ?? {}) as Record<string, unknown>;
		client.setMetadata(metadata);

		const peers = roomRegistry.getPeersInRoom(
			client.getPathname(),
			client.getId(),
		);

		for (const peer of peers) {
			peer.send({
				type: MessageType.ROOM_PEER_METADATA_UPDATED,
				payload: { peerId: client.getId(), metadata },
			});
		}

		return true;
	};
};
