module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': ['@swc/jest', {
            jsc: {parser: {syntax: 'typescript'}, target: 'es2022'},
        }],
    },
    testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    // Integration tests need Docker and the built image, see jest.integration.config.js
    testPathIgnorePatterns: ['/node_modules/', '\\.integration\\.test\\.ts$'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
