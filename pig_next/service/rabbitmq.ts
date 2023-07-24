import amqp, { Channel } from "amqplib";

// class RabbitMQClient {
//   // private static instance: RabbitMQClient;
//   private static channel: Channel | undefined;

//   constructor() {
//     if (!globalRabbit.rabbitChannel) return;

//     try {
//       // this.connect();
//       // this.init();

//       console.log("RabbitMQService init success");
//     } catch (err) {
//       console.log("RabbitMQService init failed");
//       console.log(err);
//       throw err;
//     }
//   }

//   public getChannel(): Channel {
//     return RabbitMQClient.channel!;
//   }

//   public async init() {
//     RabbitMQClient.channel?.assertQueue("transactions", { durable: true });
//   }

//   public async connect() {
//     const connection = await amqp.connect(
//       "amqp://" + process.env.RABBITMQ_HOST + ":" + process.env.RABBITMQ_PORT
//     );
//     RabbitMQClient.channel = await connection.createChannel();
//   }
// }

// export async function createRabbitMQChannel(): Promise<amqp.Channel> {
//   try {
//     // Connect to RabbitMQ server
//     const connection = await amqp.connect(
//       "amqp://" + process.env.RABBITMQ_HOST + ":" + process.env.RABBITMQ_PORT
//     ); // Replace "localhost" with your RabbitMQ server address

//     // Create a channel
//     const channel = await connection.createChannel();
//     channel.assertQueue("transactions", { durable: true });

//     // Return the channel
//     return channel;
//   } catch (error) {
//     console.error("Error creating RabbitMQ channel:", error);
//     throw error;
//   }
// }

// export default RabbitMQClient;

// const globalRabbit = globalThis as unknown as {
//   rabbitChannel: Channel | undefined;
// };

// const rabbitService = new RabbitMQClient();
// rabbitService.connect().then(() => {
//   rabbitService.init().then(() => {
//     console.log(rabbitService.getChannel());
//     globalRabbit.rabbitChannel = rabbitService.getChannel();
//   });
// });

// export const rabbitChannel =
//   globalRabbit.rabbitChannel ?? rabbitService.getChannel();

// console.log(rabbitService.getChannel());

class RabbitMQClient {
  private static channelPromise: Promise<Channel> | undefined;

  constructor() {}

  public async getChannel(): Promise<Channel> {
    if (!RabbitMQClient.channelPromise) {
      RabbitMQClient.channelPromise = this.initialize();
    }
    return RabbitMQClient.channelPromise;
  }

  private async initialize(): Promise<Channel> {
    try {
      const connection = await amqp.connect(
        "amqp://" + process.env.RABBITMQ_HOST + ":" + process.env.RABBITMQ_PORT
      );
      const channel = await connection.createChannel();
      await channel.assertQueue("transactions", { durable: true });

      console.log("RabbitMQService init success");
      return channel;
    } catch (err) {
      console.log("RabbitMQService init failed");
      console.error(err);
      throw err;
    }
  }
}

export default RabbitMQClient;

const rabbitService = new RabbitMQClient();

console.log(rabbitService.getChannel());

export const rabbitChannelPromise = rabbitService.getChannel();
