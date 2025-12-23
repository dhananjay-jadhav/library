import { gqlSchema } from './gql-schema';

describe('gqlSchema', () => {
    it('should work', () => {
        expect(gqlSchema()).toEqual('gql-schema');
    });
});
