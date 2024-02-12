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

import { I18nContext } from 'nestjs-i18n';
import { I18NEnums } from '../const/i18n.enum';
import { KafkaService } from '../queueService/kafkaService';
import { PostKafka } from '../queueService/post-kafka';


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
    const i18n = I18nContext.current(host);

    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;


    console.log('exception is ' + exception);
    console.log('exception.getStatus  is ' + exception.getStatus());
    console.log(exception.getResponse());

    let lang = 'en';

    if (request.headers?.language) {
      lang = request.headers?.language?.toLowerCase();
    }

    switch (exception.getStatus()) {
      case  HttpStatus.BAD_REQUEST:
        console.log( HttpStatus.BAD_REQUEST);
        try {
          const result: any = exception.getResponse();
          let message = '';
          if (result?.key) {

            message = await i18n.translate(result.key, {
              lang,
              args: result.args,
            });
            return response.status(status).json({ message, statusCode:  HttpStatus.BAD_REQUEST,errorCode:result?.code });
          }else if(result?.message){
            message=result.message;

            if(result?.code){
                return response.status(status).json({ message, statusCode:  HttpStatus.BAD_REQUEST,errorCode: result?.code });
            }else{
                return response.status(status).json({ message, statusCode:  HttpStatus.BAD_REQUEST });
            }
             
          }else{
            console.log('message is ' + message + 'result is ' + result);
            const finalExcep = {
               
              clientResponse: exception.getResponse(),
            };
            this.logger.warn(`${JSON.stringify(finalExcep)}   `);
            response.status(status).json(exception.getResponse());
          }
        } catch (error) {
          console.log(
            `${this.exceptionTopic} topic cannot connected due to` + error,
          );
        }
        break;
      case HttpStatus.UNAUTHORIZED:
        console.log( HttpStatus.UNAUTHORIZED);
        try {
          const message = await getI18nNotAuthorizedMessage(
            i18n,
            request,
            lang,
          );
          const clientResponse = { statusCode:status, message,errorCode:401 };
          const finalExcep = {
             
            clientResponse,
          };
          console.log(`${this.exceptionTopic} sending to topic from code 401`);
          this.logger.warn(`${JSON.stringify(finalExcep)}   `);
          response.status(status).json(clientResponse);
        } catch (error) {
          console.log(
            `${this.exceptionTopic} topic cannot connected due to ` + error,
          );
        }
        break;
      case HttpStatus.FORBIDDEN:
        console.log( HttpStatus.FORBIDDEN);
        try {
          const message = await getI18nNotAuthorizedMessage(
            i18n,
            request,
            lang,
          );
          const clientResponse = { statusCode:status, message,errorCode:403 };
          const finalExcep = {
             
            clientResponse,
          };
        //   await this.postKafka.producerSendMessage(
        //     this.exceptionTopic,
        //     JSON.stringify(finalExcep),
        //   );
          this.logger.warn(`${JSON.stringify(finalExcep)}   `);
          response.status(status).json(clientResponse);
        } catch (error) {
          console.log(
            'FACILITY_EXCEPTION topic cannot connected due to ' + error,
          );
        }
        break;
      case HttpStatus.NOT_FOUND:
        console.log( HttpStatus.NOT_FOUND);
        const result: any = exception.getResponse();
        try {
            const result: any = exception.getResponse();
            let message = '';
            if (result?.key) {
  
              message = await i18n.translate(result.key, {
                lang,
                args: result.args,
              });
              return response.status(status).json({ message, statusCode: HttpStatus.NOT_FOUND,errorCode:result?.code });
            }else if(result?.message){
              message=result.message;
  
              if(result?.code){
                  return response.status(status).json({ message, statusCode:  HttpStatus.NOT_FOUND,errorCode: result?.code });
              }else{
                  return response.status(status).json({ message, statusCode:  HttpStatus.NOT_FOUND });
              }
               
            }else{
              console.log('message is ' + message + 'result is ' + result);
              const finalExcep = {
                 
                clientResponse: exception.getResponse(),
              };
              this.logger.warn(`${JSON.stringify(finalExcep)}   `);
              response.status(status).json(exception.getResponse());
            }
        } catch (error) {
          this.logger.error(`${JSON.stringify(error)}   `);
        }
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        console.log( HttpStatus.INTERNAL_SERVER_ERROR);
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
          const clientResponse = { statusCode:status, message };
          const finalExcep = {
             
            clientResponse,
          };
        //   await this.postKafka.producerSendMessage(
        //     this.exceptionTopic,
        //     JSON.stringify(finalExcep),
        //   );
          this.logger.error(`${JSON.stringify(exception.message)}   `);
          response.status(status).json({ message: exception.message });
          break;
        } catch (error) {
          const clientResponse = { statusCode:status, error };
          const finalExcep = {
             
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
             
            clientResponse,
          };
        //   await this.postKafka.producerSendMessage(
        //     this.exceptionTopic,
        //     JSON.stringify(finalExcep),
        //   );
          this.logger.error(`${JSON.stringify(exception.message)}   `);
          response.status(status).json(exception.message);
          break;
        } catch (error) {
          const clientResponse = { statusCode:status, error };
          const finalExcep = {
             
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
