import { I18nService } from 'nestjs-i18n';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { I18NEnums } from '../const/i18n.enum';
import { KafkaService } from '../queueService/kafkaService';
import { PostKafka } from '../queueService/post-kafka';
import { Topics } from '../const/kafta.topic.enum';
import { ExceptionType } from '../const/exception.type';
import { createExceptionReqResLogObj } from '../func/generate.exception.logobject';
import { KafkaConfig } from 'kafkajs';

/**
 * Catch HttpExceptions and send this exception to messagebroker  to save the database
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * create variable for postKafka Service
   */
  postKafka: PostKafka;

  topic;
  /**
   * inject i18nService
   */
  constructor(
    private readonly i18n,
    kafkaConfig: KafkaConfig,
    topic,
  ) {
    this.postKafka = new PostKafka(new KafkaService(kafkaConfig));
    this.topic = topic;
  }
  /**
   * Log from Logger
   */
  private logger = new Logger('HTTP');
  /**
   * Catch method for  handle HttpExceptions
   */
  async catch(exception: HttpException, host: ArgumentsHost) {
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

    switch (exception.getStatus()) {
      case 400:
        try {
          const finalExcep = {
            reqResObject,
            clientResponse: exception.getResponse(),
          };
          await this.postKafka.producerSendMessage(
            this.topic,
            JSON.stringify(finalExcep),
          );
          this.logger.warn(`${JSON.stringify(finalExcep)}   `);
          response.status(status).json(exception.getResponse());
        } catch (error) {
          console.log('`USER_EXCEPTION topic cannot connected due to ' + error);
        }
        break;
      case 401:
        try {
          const message = await getI18nNotAuthorizedMessage(this.i18n, request);
          const clientResponse = { status, message };
          const finalExcep = {
            reqResObject,
            clientResponse,
          };
          await this.postKafka.producerSendMessage(
            this.topic,
            JSON.stringify(finalExcep),
          );
          console.log(`USER_EXCEPTION sending to topic from code 401`);
          this.logger.warn(`${JSON.stringify(finalExcep)}   `);
          response.status(status).json(clientResponse);
        } catch (error) {
          console.log('`USER_EXCEPTIONtopic cannot connected due to ' + error);
        }
        break;
      case 403:
        try {
          const message = await getI18nNotAuthorizedMessage(this.i18n, request);
          const clientResponse = { status, message };
          const finalExcep = {
            reqResObject,
            clientResponse,
          };
          await this.postKafka.producerSendMessage(
            this.topic,
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
        const result: any = exception.getResponse();
        try {
          let message = '';
          if (result.key) {
            message = await this.i18n.translate(result.key, {
              lang: ctx.getRequest().i18nLang,
              args: result.args,
            });
          }
          const clientResponse = { status, message };
          const finalExcep = {
            reqResObject,
            clientResponse,
          };
          await this.postKafka.producerSendMessage(
            this.topic,
            JSON.stringify(finalExcep),
          );
          this.logger.warn(`${JSON.stringify(finalExcep)}   `);
          response.status(status).json(clientResponse);
        } catch (error) {
          this.logger.error(`${JSON.stringify(error)}   `);
        }
        break;

      default:
        let message = '';
        if (result.key) {
          message = await this.i18n.translate(result.key, {
            lang: ctx.getRequest().i18nLang,
            args: result.args,
          });
        }
        const clientResponse = { status, message };
        const finalExcep = {
          reqResObject,
          clientResponse,
        };
        await this.postKafka.producerSendMessage(
          this.topic,
          JSON.stringify(finalExcep),
        );
        this.logger.error(`${JSON.stringify(exception.message)}   `);
        response.status(status).json(exception.message);
        break;
    }
  }
}

/**
 * Get User not authorized message with i18n
 */
async function getI18nNotAuthorizedMessage(i18n: I18nService, request) {
  const username = request.user?.name || 'Guest';
  return await i18n.translate(I18NEnums.USER_NOT_HAVE_PERMISSION, {
    lang: request.i18nLang,
    args: { username },
  });
}
