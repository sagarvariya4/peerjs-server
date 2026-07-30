import { MessageType } from "../../../enums.ts";
import type { IClient } from "../../../models/client.ts";
import type { IMessage } from "../../../models/message.ts";
import { IRealm } from "../../../models/realm.ts";

export const SetMetadataHandler = ({
	realm,
}: {
	realm: IRealm;
}): ((client: IClient | undefined, message: IMessage) => boolean) => {
	return (client: IClient | undefined, message: IMessage): boolean => {
		if (!client) return false;

		const metadata = (message.payload ?? {}) as Record<string, unknown>;
		client.setMetadata(metadata);

		const peers = realm.getPeersInCluster(
			client.getClusterId(),
			client.getId(),
		);

		for (const peer of peers) {
			peer.send({
				type: MessageType.CLUSTER_PEER_METADATA_UPDATED,
				payload: { peerId: client.getId(), metadata },
			});
		}

		return true;
	};
};
