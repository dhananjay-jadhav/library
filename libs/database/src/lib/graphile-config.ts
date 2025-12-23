import 'graphile-config';

import { isDev } from '@book-library/utils';
import { PgSimplifyInflectionPreset } from '@graphile/simplify-inflection';
import { makePgService } from 'postgraphile/adaptors/pg';
import { PostGraphileAmberPreset } from 'postgraphile/presets/amber';

import { pool } from './database-config';

// Database connection configuration
const pgServices = makePgService({
    pool,
    schemas: ['public'],
    pubsub: true, // Enable subscriptions
});

export const preset: GraphileConfig.Preset = {
    extends: [PostGraphileAmberPreset, PgSimplifyInflectionPreset],
    pgServices: [pgServices],
    grafserv: {
        // Server settings
        port: Number(process.env.PORT) || 3000,
        host: process.env.HOST || 'localhost',
        // GraphiQL settings (disable in production)
        graphiql: isDev,
        graphiqlOnGraphQLGET: isDev,
        // Watch mode (disable in production)
        watch: isDev ? true : false,
        graphqlPath: process.env.GRAPHQL_PATH || '/graphql',
        eventStreamPath: '/graphql/stream',
        graphiqlPath: '/graphiql',
        websockets: true,
    },
    grafast: {
        // Explain mode for debugging (disable in production)
        explain: isDev,
        // Context callback for request-specific context
        // context: requestContext => {
        //     return {
        //         // Add request-specific context here
        //     };
        // },
    },
    schema: {
        // Schema export for tooling (development only)
        exportSchemaSDLPath: isDev ? './libs/gql-schema/src/lib/schema.graphql' : undefined,
        sortExport: true,
    },
};
