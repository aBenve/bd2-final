import amqp, { Channel, Connection } from "amqplib";

class RabbitMQService {
  private static instance: RabbitMQService;
  private channel: Channel | undefined;

  private constructor() {
    try {
      this.connect();
    } catch (err) {
      console.log("RabbitMQService init failed");
      console.log(err);
      throw err;
    }
  }

  public static getInstance(): RabbitMQService {
    if (!RabbitMQService.instance) {
      RabbitMQService.instance = new RabbitMQService();
    }

    return RabbitMQService.instance;
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

const rabbitMQService = RabbitMQService.getInstance();

export default rabbitMQService;
