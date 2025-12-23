import { logger } from '@book-library/utils';
import { Pool, PoolConfig } from 'pg';

const poolConfig: PoolConfig = {
    // --- Core Connection ---
    connectionString: process.env.DATABASE_URL,
    application_name: process.env.APP_NAME || 'book-library-api',

    // --- Timeouts ---
    // Sets a server-side timeout for any single query. Prevents runaway queries.
    // Best Practice: 30 seconds is a generous but safe limit for API requests.
    statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT_MS || '30000', 10),

    // Client-side timeout for the entire query cycle (e.g., acquiring a client + running the query).
    // Best Practice: Set slightly higher than statement_timeout to allow the server to time out first.
    query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT_MS || '35000', 10),

    // How long to wait for a connection from the pool.
    // Best Practice: 5-10 seconds. Fail fast if the pool is exhausted.
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '10000', 10),

    // --- Pool Sizing ---
    // The maximum number of clients in the pool.
    // Best Practice: (DB's max_connections / num_of_app_instances) - buffer. Start with 15-20 for a typical API.
    max: parseInt(process.env.DB_POOL_SIZE_MAX || '20', 10),

    // The minimum number of clients to keep in the pool.
    // Best Practice: 2-4. Helps handle initial traffic spikes without the delay of creating new connections.
    min: parseInt(process.env.DB_POOL_SIZE_MIN || '4', 10),

    // --- Connection Lifecycle & Health ---
    // How long a client can be idle before being closed and removed from the pool.
    // Best Practice: 30 seconds. This should be longer than your keep-alive probe.
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),

    // How long a client can live before being closed, even if active.
    // **CRITICAL for reliability.** Prevents issues with DB failovers or stale connections.
    // Best Practice: 30 to 60 minutes.
    maxLifetimeSeconds: parseInt(process.env.DB_MAX_LIFETIME_SECS || 30 * 60 + '', 10), // 30 minutes

    // --- Keep-Alive ---
    // Enables TCP keep-alive probes to prevent firewalls/NATs from dropping idle connections.
    keepAlive: true,

    // How long to wait before sending the first keep-alive probe on an idle connection.
    // Best Practice: 10-20 seconds. Must be less than idleTimeoutMillis.
    keepAliveInitialDelayMillis: parseInt(process.env.DB_KEEPALIVE_DELAY_MS || '20000', 10),
};

export const pool = new Pool(poolConfig);

// Graceful shutdown
export async function closePool(): Promise<void> {
    await pool.end();
}

export async function checkPGDatabaseHealth(): Promise<boolean> {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        return true;
    } catch (error) {
        logger.error(error, 'Database health check failed:');
        return false;
    }
}
