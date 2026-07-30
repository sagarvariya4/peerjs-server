import type WebSocket from "ws";

export interface IClient {
	getId(): string;

	getToken(): string;

	getSocket(): WebSocket | null;

	setSocket(socket: WebSocket | null): void;

	getLastPing(): number;

	setLastPing(lastPing: number): void;

	send<T>(data: T): void;

	// --- room / presence additions ---
	getPathname(): string;

	getMetadata(): Record<string, unknown>;

	setMetadata(metadata: Record<string, unknown>): void;
}

export class Client implements IClient {
	private readonly id: string;
	private readonly token: string;
	private socket: WebSocket | null = null;
	private lastPing: number = new Date().getTime();
	private readonly pathname: string;
	private metadata: Record<string, unknown>;

	constructor({
		id,
		token,
		pathname = "default",
		metadata = {},
	}: {
		id: string;
		token: string;
		pathname?: string;
		metadata?: Record<string, unknown>;
	}) {
		this.id = id;
		this.token = token;
		this.pathname = pathname;
		this.metadata = metadata;
	}

	public getId(): string {
		return this.id;
	}

	public getToken(): string {
		return this.token;
	}

	public getSocket(): WebSocket | null {
		return this.socket;
	}

	public setSocket(socket: WebSocket | null): void {
		this.socket = socket;
	}

	public getLastPing(): number {
		return this.lastPing;
	}

	public setLastPing(lastPing: number): void {
		this.lastPing = lastPing;
	}

	public send<T>(data: T): void {
		this.socket?.send(JSON.stringify(data));
	}

	public getPathname(): string {
		return this.pathname;
	}

	public getMetadata(): Record<string, unknown> {
		return this.metadata;
	}

	public setMetadata(metadata: Record<string, unknown>): void {
		this.metadata = metadata;
	}
}
