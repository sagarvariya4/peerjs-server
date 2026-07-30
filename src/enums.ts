export enum Errors {
	INVALID_KEY = "Invalid key provided",
	INVALID_TOKEN = "Invalid token provided",
	INVALID_WS_PARAMETERS = "No id, token, or key supplied to websocket server",
	CONNECTION_LIMIT_EXCEED = "Server has reached its concurrent user limit",
}

export enum MessageType {
	OPEN = "OPEN",
	LEAVE = "LEAVE",
	CANDIDATE = "CANDIDATE",
	OFFER = "OFFER",
	ANSWER = "ANSWER",
	EXPIRE = "EXPIRE",
	HEARTBEAT = "HEARTBEAT",
	ID_TAKEN = "ID-TAKEN",
	ERROR = "ERROR",

	// --- room / presence additions ---
	LIST_PEERS = "LIST_PEERS", // client -> server: "send me the current room list"
	PEERS_LIST = "PEERS_LIST", // server -> client: response to LIST_PEERS (and sent once automatically on join)
	ROOM_PEER_JOINED = "ROOM_PEER_JOINED", // server -> other clients in room
	ROOM_PEER_LEFT = "ROOM_PEER_LEFT", // server -> other clients in room
	RELAY = "RELAY", // client -> server -> specific peer, no WebRTC connection required
	SET_METADATA = "SET_METADATA", // client -> server: update this peer's own metadata post-connect
	ROOM_PEER_METADATA_UPDATED = "ROOM_PEER_METADATA_UPDATED", // server -> other clients in room
}
