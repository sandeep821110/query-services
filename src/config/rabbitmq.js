import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

let connection = null;
let channel = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = process.env.QUEUE_NAME || 'query_queue';
const EXCHANGE_NAME = 'query_exchange';

// Connect to RabbitMQ with retry logic
export const connectRabbitMQ = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`🔗 Connecting to RabbitMQ (attempt ${i + 1}/${retries})...`);
            connection = await amqp.connect(RABBITMQ_URL);
            channel = await connection.createChannel();

            // Create exchange
            await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
            console.log(`✓ Exchange created: ${EXCHANGE_NAME}`);

            // Create queue
            await channel.assertQueue(QUEUE_NAME, { durable: true });
            console.log(`✓ Queue created: ${QUEUE_NAME}`);

            // Bind queue to exchange
            await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, 'query.*');
            console.log(`✓ Queue bound to exchange with routing key: query.*`);

            console.log('✓ Connected to RabbitMQ successfully');
            
            // Handle connection events
            connection.on('error', (err) => {
                console.error('❌ RabbitMQ connection error:', err.message);
            });

            connection.on('close', () => {
                console.warn('⚠ RabbitMQ connection closed');
                connection = null;
                channel = null;
            });

            return { connection, channel };
        } catch (error) {
            console.error(`❌ RabbitMQ connection attempt ${i + 1} failed:`, error.message);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
            } else {
                console.error('❌ Failed to connect to RabbitMQ after retries');
                throw error;
            }
        }
    }
};

// Disconnect from RabbitMQ
export const disconnectRabbitMQ = async () => {
    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
        console.log('✓ Disconnected from RabbitMQ');
    } catch (error) {
        console.error('❌ Error disconnecting from RabbitMQ:', error.message);
    }
};

// Publish message to queue
export const publishMessage = async (routingKey, message) => {
    try {
        if (!channel) {
            throw new Error('RabbitMQ channel not initialized. Please call connectRabbitMQ first.');
        }

        const msg = {
            type: routingKey,
            data: message,
            timestamp: new Date().toISOString(),
            uuid: Math.random().toString(36).substring(7)
        };

        const published = channel.publish(
            EXCHANGE_NAME,
            routingKey,
            Buffer.from(JSON.stringify(msg)),
            { persistent: true }
        );

        if (published) {
            console.log(`✓ Message published [${routingKey}]:`, msg.uuid);
        } else {
            console.warn(`⚠ Message may not be published [${routingKey}]:`, msg.uuid);
        }
        return published;
    } catch (error) {
        console.error('❌ Error publishing message:', error.message);
        return false;
    }
};

// Consume messages from queue with retry and error handling
export const consumeMessages = async (callback) => {
    try {
        if (!channel) {
            throw new Error('RabbitMQ channel not initialized');
        }

        // Set prefetch count for fair dispatch
        await channel.prefetch(1);
        console.log('✓ Message consumer prefetch set to 1');

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    console.log(`✓ Message received [${content.type}]:`, content.uuid);

                    // Call the callback function
                    await callback(content);

                    // Acknowledge message after successful processing
                    channel.ack(msg);
                    console.log(`✓ Message acknowledged [${content.type}]:`, content.uuid);
                } catch (error) {
                    console.error('❌ Error processing message:', error.message);
                    // Reject message and requeue it for retry
                    channel.nack(msg, false, true);
                    console.log('⚠ Message requeued due to processing error');
                }
            }
        }, { noAck: false });

        console.log('✓ Message consumer started');
    } catch (error) {
        console.error('❌ Error starting message consumer:', error.message);
        throw error;
    }
};

// export { EXCHANGE_NAME, QUEUE_NAME };


export { connection, channel, QUEUE_NAME, EXCHANGE_NAME };
