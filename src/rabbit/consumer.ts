import { RabbitExchange } from "./producer";

async function consumeExchange() {
    const exchange = new RabbitExchange('amqp://localhost', 'my_exchange', 'direct');
    await exchange.connect();
    await exchange.publish('routing_key', 'Hello World');
    await exchange.close();
}