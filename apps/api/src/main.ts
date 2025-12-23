import { checkPGDatabaseHealth, closePool, preset } from '@book-library/database';
import { createHttpLogger, logger } from '@book-library/utils';
import express from 'express';
import { grafserv } from 'grafserv/express/v4';
import { postgraphile } from 'postgraphile';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// HTTP request logging middleware (first middleware)
app.use(createHttpLogger());

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', async (_req, res) => {
    const dbHealthy = await checkPGDatabaseHealth();

    if (dbHealthy) {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected',
        });
    } else {
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
        });
    }
});

// Readiness probe
app.get('/ready', async (_req, res) => {
    const dbHealthy = await checkPGDatabaseHealth();
    res.status(dbHealthy ? 200 : 503).json({ ready: dbHealthy });
});

// PostGraphile v5 setup
async function startServer(): Promise<void> {
    try {
        // Create PostGraphile instance (pass pool and schemas)
        const pgl = postgraphile(preset);

        // Create Grafserv instance for Express
        const serv = pgl.createServ(grafserv);

        // Start server
        const server = app.listen(port, host, () => {
            logger.info(`🚀 Server ready at http://${host}:${port}`);
            logger.info(`📊 GraphQL endpoint:  http://${host}:${port}/graphql`);
            if (process.env.NODE_ENV === 'development') {
                logger.info(`🔧 GraphiQL: http://${host}:${port}/graphiql`);
            }
        });

        // Add GraphQL routes to Express (attach to the HTTP server for websocket support)
        await serv.addTo(app, server);

        // Graceful shutdown
        const shutdown = (signal: string): void => {
            logger.info(`\n${signal} received.  Shutting down gracefully...`);

            server.close(async () => {
                logger.info('HTTP server closed');
                await closePool();
                logger.info('Database pool closed');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (error) {
        logger.error(error, 'Failed to start server:');
        process.exit(1);
    }
}

startServer().catch(error => {
    logger.error(error, 'Unexpected error during server startup:');
    process.exit(1);
});
