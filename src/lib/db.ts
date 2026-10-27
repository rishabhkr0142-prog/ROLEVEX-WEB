import mongoose from "mongoose";

/**
 * Cached mongoose connection for Vercel serverless functions.
 * On serverless, the module scope survives between invocations of the same
 * warm instance, so we cache the connection promise instead of calling
 * `mongoose.connect()` on every request (which would exhaust Atlas connections).
 */
interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = global as typeof globalThis & { __mongoose?: Cached };

const cached: Cached = globalWithMongoose.__mongoose ?? { conn: null, promise: null };
globalWithMongoose.__mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set on the server.");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        // The bot owns the data; keep the website read/write only.
        bufferCommands: false,
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // allow retry on the next invocation
    throw err;
  }

  return cached.conn;
}
