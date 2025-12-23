import pino, { Logger, LoggerOptions } from 'pino';
import { isDev } from './utils';

export interface AppLoggerOptions {
    name?: string;
    level?: string;
    pretty?: boolean;
}

const defaultOptions: LoggerOptions = {
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
};

function createLogger(options: AppLoggerOptions = {}): Logger {
    const loggerOptions: LoggerOptions = {
        ...defaultOptions,
        name: options.name || 'book-library',
        level: options.level || defaultOptions.level,
    };

    return pino(loggerOptions);
}

export const logger = createLogger();

// Child logger factory for specific modules
export function createChildLogger(module: string, context?: Record<string, unknown>): Logger {
    return logger.child({ module, ...context });
}
