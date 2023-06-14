import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { KafkaConfig } from 'kafkajs';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { createReqLogObj } from '../func/generate.log.object';
import { checkObjectIddİsValid } from '../func/objectId.check';
import { KafkaService } from '../queueService/kafkaService';
import { PostKafka } from '../queueService/post-kafka';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Decorator for interceptor to use fact in modules,controller
 */

/**
 * Custom interceptor for log all endpoints and send this log to messagebroler  to save the database
 */
export class LoggingInterceptor implements NestInterceptor {
  /**
   * create variable for postKafka Service
   */
  postKafka: PostKafka;
  /**
   * create kafka service
   */
  kafkaConfig: KafkaConfig;

  logTopic;

  operationsTopic;
  constructor(kafkaConfig: KafkaConfig, logTopic, operationsTopic) {
    this.postKafka = new PostKafka(new KafkaService(kafkaConfig));
    this.logTopic = logTopic;
    this.operationsTopic = operationsTopic;
  }
  /**
   * Log from Logger
   */
  private logger = new Logger('HTTP');

  /**
   * Intercept method implements from NestInterceptor
   */
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const isHttp = context.getType() === 'http';
    let httpContext, gqlContext;
    let request, response;

    if (isHttp) {
      httpContext = context.switchToHttp();
      request = httpContext.getRequest();
      response = httpContext.getResponse();
    } else {
      gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
      response = gqlContext.getContext().res;
    }
    const query = request.params;
    const user: object = request.user;
    const method = request.method;
    const now = Date.now();
    const url = request.url;

    if (request.headers?.language) {
      request.headers['language'] = request.headers['language'].toLowerCase();
    } else {
      request.headers['language'] = 'en';
    }

    if (request.user && Object.keys(request.user).length > 0) {
      const realm = request.user.iss.split('realms/')[1];
      request.headers['realm'] = realm;
    }

    //key and realm cannot updated
    if (method === 'PATCH') {
      delete request.body['key'];
      delete request.body['realm'];
    }

    //this parsedUrl for the get which endpoints hit by user
    const parsedUrl = url.match(/^\/[^\?\/]*/)[0];
    // this event triggered when request is and response is done
    const requestInformation = createReqLogObj(request);
    response.on('close', async () => {
      const { statusCode, statusMessage } = response;

      const responseInformation = {
        statusCode,
        statusMessage,
        responseTime: `${Date.now() - now} ms`,
      };

      const log = { requestInformation, responseInformation };
      try {
        await this.postKafka.producerSendMessage(
          this.logTopic,
          JSON.stringify(log),
        );
        if (request?.url !== '/health') {
          console.log(`${this.operationsTopic} topic send succesful`);
          console.log(`${this.logTopic} topic send succesful`);
        }
      } catch (error) {
        console.log(`${this.logTopic} topic cannot connected due to ` + error);
      }
      this.logger.log(`${JSON.stringify(log)}   `);
    });
    if (query._id) {
      checkObjectIddİsValid(query._id);
    }
    return next.handle().pipe(
      tap(async (responseBody) => {
        try {
          const finalResponse = { responseBody, user, requestInformation };
          if (method !== 'GET') {
            await this.postKafka.producerSendMessage(
              this.operationsTopic,
              JSON.stringify(finalResponse),
              parsedUrl,
            );
            if (request?.url !== '/health') {
              console.log(`${this.operationsTopic} topic send succesful`);
            }
          }
        } catch (error) {
          console.log(
            `${this.operationsTopic} topic cannot connected due to ` + error,
          );
        }
      }),
    );
  }
}
