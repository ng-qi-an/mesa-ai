import { createResumableStreamContext } from "resumable-stream";
import { createClient } from "redis";
import { after } from "next/server";

const publisher = createClient({ url: process.env.REDIS_URL });
const subscriber = createClient({ url: process.env.REDIS_URL });

publisher.on("error", (err) => console.error("publisher error:", err));
subscriber.on("error", (err) => console.error("subscriber error:", err));

await Promise.all([publisher.connect(), subscriber.connect()]);

export const streamContext = createResumableStreamContext({waitUntil: after, publisher, subscriber});