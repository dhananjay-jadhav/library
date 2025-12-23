import { logger } from '@book-library/utils';
import { Pool, PoolConfig } from 'pg';

const poolCofig: PoolConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_DATABASE,
    statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT_MS || '60000', 10), // number of milliseconds before a statement in query will time out, default is no timeout
    query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT_MS || '30000', 10), // number of milliseconds before a query call will timeout, default is no timeout
    application_name: process.env.APP_NAME, // The name of the application that created this Client instance
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '2000', 10), // number of milliseconds to wait for connection, default is no timeout
    keepAlive: true,
    keepAliveInitialDelayMillis: parseInt(process.env.DB_KEEPALIVE_DELAY_MS || '10000', 10), // set the initial delay before the first keepalive probe is sent on an idle socket
    max: parseInt(process.env.DB_POOL_SIZE_MAX || '30', 10),
    min: parseInt(process.env.DB_POOL_SIZE_MIN || '5', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '10000', 10),
    maxLifetimeSeconds: parseInt(process.env.DB_MAX_LIFETIME_SECS || '60', 10),
};

export const pool = new Pool(poolCofig);

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
