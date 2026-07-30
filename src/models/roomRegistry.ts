import type { IClient } from "./client.ts";

export interface IRoomRegistry {
	join(client: IClient): void;

	leave(client: IClient): void;

	getPeersInRoom(pathname: string, excludeId?: string): IClient[];
}

export class RoomRegistry implements IRoomRegistry {
	// roomKey -> Map<peerId, client>
	private readonly rooms = new Map<string, Map<string, IClient>>();

	public join(client: IClient): void {
		const key = client.getPathname();
		if (!this.rooms.has(key)) {
			this.rooms.set(key, new Map());
		}
		this.rooms.get(key)?.set(client.getId(), client);

		console.log("join:rooms", this.rooms);
	}

	public leave(client: IClient): void {
		const key = client.getPathname();
		const room = this.rooms.get(key);
		if (!room) return;

		room.delete(client.getId());
		if (room.size === 0) {
			this.rooms.delete(key);
		}

		console.log("leave:rooms", this.rooms);
	}

	public getPeersInRoom(pathname: string, excludeId?: string): IClient[] {
		const key = pathname;
		const room = this.rooms.get(key);
		if (!room) return [];

		return [...room.values()].filter((c) => c.getId() !== excludeId);
	}
}
