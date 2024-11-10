import amqp from 'amqplib';

export class RabbitExchange {
    private connection?: amqp.Connection;
    private channel?: amqp.Channel;

    constructor(
        private readonly uri: string = "amqp://rabbit:password@localhost:5672",
        private readonly exchange: string,
        private readonly exchangeType: string = "direct",
    ) {}

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(this.uri);
            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange(this.exchange, this.exchangeType, {durable: true});

            console.log(`Connected to RabbitMQ exchange ${this.exchange}`);
        } catch (error) {
            console.error(`Error connecting to RabbitMQ exchange ${this.exchange}: ${error}`);
        }
    }

    async publish(routingKey: string, message: string): Promise<void> {
        if (!this.channel) {
            throw new Error('Channel not established');
        }

        try {
            this.channel.publish(
                this.exchange,
                routingKey,
                Buffer.from(message)
            );
        } catch (error) {
            console.error('Error publishing message:', error);
            throw error;
        }
    }

    async close(): Promise<void> {
        try {
            await this.channel?.close();
            await this.connection?.close();
        } catch (error) {
            console.error('Error closing connection:', error);
            throw error;
        }
    }
}