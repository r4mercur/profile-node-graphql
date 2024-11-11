import amqp from 'amqplib';

export async function setupRabbit() {
    const connection = await amqp.connect({
        protocol: 'amqp',
        hostname: 'localhost',
        port: 5672,
        username: 'rabbit',
        password: 'password',
        vhost: '/',
    });
    const channel = await connection.createChannel();

    const exchange = 'myExchange'
    const queue = 'myQueue'
    const routingKey = 'myRoutingKey'

    await channel.assertExchange(exchange, 'direct', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    await channel.close()
    await connection.close()
}