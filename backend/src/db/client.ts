import { createClient, type Client } from '@libsql/client';

const client: Client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN ?? undefined,
});

export default client;
