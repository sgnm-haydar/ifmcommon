import { Kafka, KafkaConfig, Producer } from 'kafkajs';
import { IQueueService } from './queueInterface';

/**
 *  Kafka Service
 */
export class KafkaService implements IQueueService {
  kafkaOptions: KafkaConfig;
  kafka: Kafka;
  constructor(kafkaOptions: KafkaConfig) {
    this.kafkaOptions = kafkaOptions;
    this.kafka = new Kafka(this.kafkaOptions);
  }

  /**
   *  Create Kafka Producer
   */
  producer(): Producer {
    try {
      const producer = this.kafka.producer({ allowAutoTopicCreation: true });
      return producer;
    } catch (error) {
      console.log(error);
    }
  }
}
