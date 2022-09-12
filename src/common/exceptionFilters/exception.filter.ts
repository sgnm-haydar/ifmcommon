import { I18nContext } from 'nestjs-i18n';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

import { KafkaConfig } from 'kafkajs';
import { ExceptionType } from '../const/exception.type';
import { I18NEnums } from '../const/i18n.enum';
import { createExceptionReqResLogObj } from '../func/generate.exception.logobject';
import { KafkaService } from '../queueService/kafkaService';
import { PostKafka } from '../queueService/post-kafka';
import { getI18nContextFromArgumentsHost } from 'nestjs-i18n';

/**
 * Catch HttpExceptions and send this exception to messagebroker  to save the database
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * create variable for postKafka Service
   */
  postKafka: PostKafka;

  exceptionTopic;

  constructor(kafkaConfig: KafkaConfig, exceptionTopic) {
    this.postKafka = new PostKafka(new KafkaService(kafkaConfig));
    this.exceptionTopic = exceptionTopic;
  }
  /**
   * Log from Logger
   */
  private logger = new Logger('HTTP');
  /**
   * Catch method for  handle HttpExceptions
   */
  async catch(exception: HttpException, host: ArgumentsHost) {
    const i18n = getI18nContextFromArgumentsHost(host);
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const reqResObject = createExceptionReqResLogObj(
      request,
      exception,
      ExceptionType.HTTP_EXCEPTİON,
    );
    console.log('exception is ' + exception);
    console.log('exception.getStatus  is ' + exception.getStatus());
    console.log(exception.getResponse());

    let lang = 'en';

    if (request.headers?.language) {
      lang = request.headers.language.toLowerCase();
    }

    switch (exception.getStatus()) {
      case 400:
        console.log(400);
        try {
          const result: any = exception.getResponse();
          let message = '';
          if (result?.key) {
            message = await i18n.translate(result.key, {
              lang,
              args: result.args,
            });
            const finalExcep = {
              reqResObject,
              clientResponse: { message, statusCode: 400 },
            };
            await this.postKafka.producerSendMessage(
              this.exceptionTopic,
              JSON.stringify(finalExcep),
            );
            return response.status(status).json({ message, statusCode: 400 });
          }
          console.log('message is ' + message + 'result is ' + result);
          const finalExcep = {
            reqResObject,
            clientResponse: exception.getResponse(),
          };
          await this.postKafka.producerSendMessage(
            this.exceptionTopic,
            JSON.stringify(finalExcep),
          );
          this.logger.warn(`${JSON.stringify(finalExcep)}   `);
          response.status(status).json(exception.getResponse());
        } catch (error) {
          console.log(
            `${this.exceptionTopic} topic cannot connected due to` + error,
          );
        }
        break;
      case 401:
        console.log(401);
        try {
          const message = await getI18nNotAuthorizedMessage(
            i18n,
            request,
            lang,
          );
          const clientResponse = { status, message };
          const finalExcep = {
            reqResObject,
            clientResponse,
          };
          await this.postKafka.producerSendMessage(
            this.exceptionTopic,
            JSON.stringify(finalExcep),
          );
          console.log(`${this.exceptionTopic} sending to topic from code 401`);
          this.logger.warn(`${JSON.stringify(finalExcep)}   `);
          response.status(status).json(clientResponse);
        } catch (error) {
          console.log(
            `${this.exceptionTopic} topic cannot connected due to ` + error,
          );
        }
        break;
      case 403:
        console.log(403);
        try {
          const message = await getI18nNotAuthorizedMessage(
            i18n,
            request,
            lang,
          );
          const clientResponse = { status, message };
          const finalExcep = {
            reqResObject,
            clientResponse,
          };
          await this.postKafka.producerSendMessage(
            this.exceptionTopic,
            JSON.stringify(finalExcep),
          );
          this.logger.warn(`${JSON.stringify(finalExcep)}   `);
          response.status(status).json(clientResponse);
        } catch (error) {
          console.log(
            'FACILITY_EXCEPTION topic cannot connected due to ' + error,
          );
        }
        break;
      case 404:
        console.log(404);
        const result: any = exception.getResponse();
        try {
          let message = '';
          if (result?.key) {
            message = await i18n.translate(result.key, {
              lang,
              args: result.args,
            });
            const finalExcep = {
              reqResObject,
              clientResponse: { message, statusCode: 404 },
            };
            await this.postKafka.producerSendMessage(
              this.exceptionTopic,
              JSON.stringify(finalExcep),
            );
            return response.status(status).json({ message, statusCode: 404 });
          }
          const finalExcep = {
            reqResObject,
            clientResponse: exception.getResponse(),
          };
          await this.postKafka.producerSendMessage(
            this.exceptionTopic,
            JSON.stringify(finalExcep),
          );
          this.logger.warn(`${JSON.stringify(finalExcep)}   `);
          response.status(status).json(exception.getResponse());
        } catch (error) {
          this.logger.error(`${JSON.stringify(error)}   `);
        }
        break;
      case 500:
        console.log(500);
        console.log(exception);
        try {
          const result: any = exception.getResponse();
          console.log('result is ' + result);
          let message = 'something goes wrong';

          if (result?.key) {
            message = await i18n.translate(result.key, {
              lang,
              args: result.args,
            });
          }
          const clientResponse = { status, message };
          const finalExcep = {
            reqResObject,
            clientResponse,
          };
          await this.postKafka.producerSendMessage(
            this.exceptionTopic,
            JSON.stringify(finalExcep),
          );
          this.logger.error(`${JSON.stringify(exception.message)}   `);
          response.status(status).json({ message: exception.message });
          break;
        } catch (error) {
          const clientResponse = { status, error };
          const finalExcep = {
            reqResObject,
            clientResponse,
          };
          await this.postKafka.producerSendMessage(
            this.exceptionTopic,
            JSON.stringify(finalExcep),
          );
          this.logger.error(`${JSON.stringify(exception.message)}   `);
          response.status(status).json(exception.message);
          break;
        }
      default:
        console.log('other');
        try {
          let message = 'something goes wrong';
          if (result?.key) {
            message = await i18n.translate(result.key, {
              lang,
              args: result.args,
            });
          }
          const clientResponse = { status, message };
          const finalExcep = {
            reqResObject,
            clientResponse,
          };
          await this.postKafka.producerSendMessage(
            this.exceptionTopic,
            JSON.stringify(finalExcep),
          );
          this.logger.error(`${JSON.stringify(exception.message)}   `);
          response.status(status).json(exception.message);
          break;
        } catch (error) {
          const clientResponse = { status, error };
          const finalExcep = {
            reqResObject,
            clientResponse,
          };
          await this.postKafka.producerSendMessage(
            this.exceptionTopic,
            JSON.stringify(finalExcep),
          );
          this.logger.error(`${JSON.stringify(exception.message)}   `);
          response.status(status).json(exception.message);
          break;
        }
    }
  }
}

/**
 * Get User not authorized message with i18n
 */
async function getI18nNotAuthorizedMessage(
  i18n: I18nContext,
  request,
  lang = 'en',
) {
  const username = request.user?.name || 'Guest';
  if (request.headers?.language) {
    lang = request.headers?.language.toLowerCase();
  }
  return await i18n.translate(I18NEnums.USER_NOT_HAVE_PERMISSION, {
    lang,
    args: { username },
  });
}
