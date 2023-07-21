import amqp, { Channel, Connection } from "amqplib";

class RabbitMQClient {
  private static instance: RabbitMQClient;
  private channel: Channel | undefined;

  constructor() {
    if (globalRabbit.rabbitChannel !== null) return;

    try {
      this.connect();
      console.log("RabbitMQService init success");
    } catch (err) {
      console.log("RabbitMQService init failed");
      console.log(err);
      throw err;
    }
  }

  public getInstance(): RabbitMQClient {
    if (!RabbitMQClient.instance) {
      RabbitMQClient.instance = new RabbitMQClient();
    }

    return RabbitMQClient.instance;
  }

  public async connect() {
    const connection = await amqp.connect(
      "amqp://" + process.env.RABBITMQ_HOST + ":" + process.env.RABBITMQ_PORT
    );
    this.channel = await connection.createChannel();
  }

  public async consume(queue: string, callback: (data: any) => void) {
    return this.channel!.consume(queue, (message) => {
      if (!message) {
        return;
      }

      const data = JSON.parse(message.content.toString());
      callback(data);
      this.channel!.ack(message);
    });
  }

  public async createQueue(queue: string) {
    return this.channel!.assertQueue(queue);
  }

  public async consumeWithOutAck(queue: string, callback: (data: any) => void) {
    return this.channel!.consume(queue, (message) => {
      if (!message) {
        return;
      }

      const data = JSON.parse(message.content.toString());
      callback(data);
    });
  }
}

export default RabbitMQClient;

const globalRabbit = globalThis as unknown as {
  rabbitChannel: RabbitMQClient | undefined;
};

export const rabbitChannel =
  globalRabbit.rabbitChannel ?? new RabbitMQClient().getInstance();

if (process.env.NODE_ENV !== "production")
  globalRabbit.rabbitChannel = rabbitChannel;
