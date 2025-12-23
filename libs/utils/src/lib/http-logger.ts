import pinoHttp, { HttpLogger, Options } from 'pino-http';
import { logger } from './logger';

const httpLoggerOptions: Options = {
    logger: logger.child({ module: 'http' }),
    quietReqLogger: true,
    quietResLogger: true,
    autoLogging: false,
};

/**
 * Create HTTP logger middleware for Express
 */
export function createHttpLogger(): HttpLogger {
    return pinoHttp(httpLoggerOptions);
}
