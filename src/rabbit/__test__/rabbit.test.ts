import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { RabbitExchange } from '../exchange';

describe('RabbitMQ Integration Test', () => {
    let container: StartedTestContainer;
    let uri: string;

    beforeAll(async () => {
        container = await new GenericContainer('rabbitmq:3-management')
            .withExposedPorts(5672, 15672)
            .start();

        const port = container.getMappedPort(5672);
        uri = `amqp://guest:guest@localhost:${port}`;
    }, 30000);

    afterAll(async () => {
        await container.stop();
    });

    it('should connect and publish a message', async () => {
        const exchange = new RabbitExchange(uri, 'testExchange');
        await exchange.connect();

        await exchange.publish('testRoutingKey', 'Hello, World!');
        await exchange.close();
    });

    it('should throw an error when publishing a message without connecting', async () => {
        const exchange = new RabbitExchange(uri, 'testExchange');
        await expect(exchange.publish('testRoutingKey', 'Hello, World!')).rejects.toThrowError();
    });
});