import { MessageType } from "../../../enums.ts";
import type { IClient } from "../../../models/client.ts";
import type { IMessage } from "../../../models/message.ts";
import { IRealm } from "../../../models/realm.ts";

export const ListPeersHandler = ({
	realm,
}: {
	realm: IRealm;
}): ((client: IClient | undefined, message: IMessage) => boolean) => {
	return (client: IClient | undefined): boolean => {
		if (!client) return false;

		const peers = realm.getPeersInCluster(
			client.getClusterId(),
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
