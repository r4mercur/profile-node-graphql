import amqp from 'amqplib';
import {config} from '../config/env';

interface Exchange {
    name: string;
    type: string;
    options: object;
}

interface Queue {
    name: string;
    options: object;
}

interface Binding {
    queue: string;
    exchange: string;
    routingKey: string;
}

export async function setupRabbit() {
    const connection = await amqp.connect({
        protocol: 'amqp',
        hostname: config.rabbit.host,
        port: config.rabbit.port,
        username: config.rabbit.user,
        password: config.rabbit.password,
        vhost: '/',
    });
    const channel = await connection.createChannel();


    const exchanges: Exchange[] = [
        {
            name: 'registrationEvents',
            type: 'direct',
            options: { durable: true }
        },
        {
            name: 'productEvents',
            type: 'direct',
            options: { durable: true }
        }
    ];

    const queues: Queue[] = [
        {
            name: 'registrationQueue',
            options: { durable: true }
        },
        {
            name: 'productQueue',
            options: { durable: true }
        }
    ];

    const bindings: Binding[] = [
        {
            queue: 'registrationQueue',
            exchange: 'registrationEvents',
            routingKey: 'registrationRoutingKey'
        },
        {
            queue: 'productQueue',
            exchange: 'productEvents',
            routingKey: 'productRoutingKey'
        }
    ];

    for (const exchange of exchanges) {
        await channel.assertExchange(exchange.name, exchange.type, exchange.options);
    }

    for (const queue of queues) {
        await channel.assertQueue(queue.name, queue.options);
    }

    for (const binding of bindings) {
        await channel.bindQueue(binding.queue, binding.exchange, binding.routingKey);
    }

    await channel.close()
    await connection.close()
}