import type { IMessageQueue } from "./messageQueue.ts";
import { MessageQueue } from "./messageQueue.ts";
import { randomUUID } from "node:crypto";
import type { IClient } from "./client.ts";
import type { IMessage } from "./message.ts";

export interface IRealm {
	getClientsIds(): string[];

	getClientById(clientId: string): IClient | undefined;

	getPeersInCluster(id: string, excludeClientId?: string): IClient[];

	getClientsIdsWithQueue(): string[];

	setClient(client: IClient, id: string): void;

	removeClientById(id: string): boolean;

	getMessageQueueById(id: string): IMessageQueue | undefined;

	addMessageToQueue(id: string, message: IMessage): void;

	clearMessageQueue(id: string): void;

	generateClientId(generateClientId?: () => string): string;
}

export class Realm implements IRealm {
	private readonly clients = new Map<string, IClient>();
	private readonly clusters = new Map<string, Set<string>>();
	private readonly messageQueues = new Map<string, IMessageQueue>();

	public getClientsIds(): string[] {
		return [...this.clients.keys()];
	}

	public getClientById(clientId: string): IClient | undefined {
		return this.clients.get(clientId);
	}

	public getPeersInCluster(id: string, excludeClientId?: string): IClient[] {
		const cluster = this.clusters.get(id);
		if (!cluster) return [];

		const peers: IClient[] = [];

		for (const clientId of cluster) {
			if (clientId === excludeClientId) continue;

			const client = this.clients.get(clientId);
			if (client) {
				peers.push(client);
			}
		}

		return peers;
	}

	public getClientsIdsWithQueue(): string[] {
		return [...this.messageQueues.keys()];
	}

	public setClient(client: IClient, id: string): void {
		this.clients.set(id, client);

		const clusterId = client.getClusterId();
		if (!this.clusters.has(clusterId)) {
			this.clusters.set(clusterId, new Set());
		}

		this.clusters.get(clusterId)?.add(id);
	}

	public removeClientById(id: string): boolean {
		const client = this.getClientById(id);

		if (!client) return false;

		this.clients.delete(id);

		const clusterId = client.getClusterId();

		const cluster = this.clusters.get(clusterId);

		if (!cluster) return false;

		cluster.delete(id);

		return true;
	}

	public getMessageQueueById(id: string): IMessageQueue | undefined {
		return this.messageQueues.get(id);
	}

	public addMessageToQueue(id: string, message: IMessage): void {
		if (!this.getMessageQueueById(id)) {
			this.messageQueues.set(id, new MessageQueue());
		}

		this.getMessageQueueById(id)?.addMessage(message);
	}

	public clearMessageQueue(id: string): void {
		this.messageQueues.delete(id);
	}

	public generateClientId(generateClientId?: () => string): string {
		const generateId = generateClientId ? generateClientId : randomUUID;

		let clientId = generateId();

		while (this.getClientById(clientId)) {
			clientId = generateId();
		}

		return clientId;
	}
}
