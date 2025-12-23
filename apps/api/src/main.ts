import express from 'express';
import { createHttpLogger, logger } from '@book-library/utils';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use(createHttpLogger());

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, host, () => {
    logger.info(`[ ready ] http://${host}:${port}`);
});
