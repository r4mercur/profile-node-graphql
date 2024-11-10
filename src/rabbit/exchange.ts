import { RabbitExchange } from "./producer";

async function createExchange() {
    const exchange = new RabbitExchange('amqp://rabbit:password@localhost:5672', 'my_exchange', 'direct');
    await exchange.connect();
    await exchange.close();
}

createExchange().then(() => console.log('Exchange created'));