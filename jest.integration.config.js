// Integration tests start Docker containers (service image, Postgres, fake GCS).
// Run with `npm run test:integration`; they are excluded from the default `npm test`.
const base = require('./jest.config');

module.exports = {
    ...base,
    testMatch: ['**/*.integration.test.ts'],
    testPathIgnorePatterns: ['/node_modules/'],
    testTimeout: 60000,
};
