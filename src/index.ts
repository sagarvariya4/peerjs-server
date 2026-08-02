import express, { type Express, type Request, type Response } from "express";
import http from "node:http";
import https from "node:https";

import type { IConfig } from "./config/index.ts";
import defaultConfig from "./config/index.ts";
import type { PeerServerEvents } from "./instance.ts";
import { createInstance } from "./instance.ts";
import type { IClient } from "./models/client.ts";
import type { IMessage } from "./models/message.ts";

export type { MessageType } from "./enums.ts";
export type { IConfig, PeerServerEvents, IClient, IMessage };

// Helper function to extract a clean public IP (strips ::ffff: prefix)
const getCleanIp = (req: Request): string => {
	const forwarded: string = req.headers["x-forwarded-for"] as string;

	let ip =
		req.ip ?? forwarded.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? "";

	if (ip.startsWith("::ffff:")) {
		ip = ip.replace("::ffff:", "");
	}

	return ip;
};

function ExpressPeerServer(
	server: https.Server | http.Server,
	options?: Partial<IConfig>,
) {
	const app = express();

	const newOptions: IConfig = {
		...defaultConfig,
		...options,
	};

	if (newOptions.proxied) {
		app.set(
			"trust proxy",
			newOptions.proxied === "false" ? false : !!newOptions.proxied,
		);
	}

	app.on("mount", () => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!server) {
			throw new Error(
				"Server is not passed to constructor - " + "can't start PeerServer",
			);
		}

		createInstance({ app, server, options: newOptions });
	});

	return app as Express & PeerServerEvents;
}

function PeerServer(
	options: Partial<IConfig> = {},
	callback?: (server: https.Server | http.Server) => void,
) {
	const app = express();

	let newOptions: IConfig = {
		...defaultConfig,
		...options,
	};

	// Ensure Express trusts Railway proxy headers
	if (newOptions.proxied) {
		app.set(
			"trust proxy",
			newOptions.proxied === "false" ? false : !!newOptions.proxied,
		);
	} else {
		app.set("trust proxy", true);
	}

	const port = newOptions.port;
	const host = newOptions.host;

	let server: https.Server | http.Server;

	const { ssl, ...restOptions } = newOptions;
	if (ssl && Object.keys(ssl).length) {
		server = https.createServer(ssl, app);

		newOptions = restOptions;
	} else {
		server = http.createServer(app);
	}

	// Request logging middleware
	app.use((req: Request, _res: Response, next) => {
		console.log("========== REQUEST ==========");
		console.log("Date:", new Date().toISOString());
		console.log("Method:", req.method);
		console.log("URL:", req.originalUrl);
		console.log("User-Agent:", req.headers["user-agent"]);
		console.log("IP:", getCleanIp(req));
		console.log("=============================");
		next();
	});

	const peerjs = ExpressPeerServer(server, newOptions);
	app.use(peerjs);

	server.listen(port, host, () => callback?.(server));

	return peerjs;
}

export { ExpressPeerServer, PeerServer };
