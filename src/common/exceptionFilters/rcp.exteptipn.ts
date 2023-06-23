import { Catch, RpcExceptionFilter, HttpException, ArgumentsHost } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError,EmptyError, of } from 'rxjs';
import { genCurrentDate } from '../func/generate.new.date';


/**
 * @class RpcExceptionFilter
 * @classdesc - This class is a custom exception filter for NestJS to catch RPC exceptions
 */
@Catch()
export class CustomRpcExceptionFilter
    implements RpcExceptionFilter<RpcException | HttpException>
{
    catch(
        exception: RpcException ,
        host: ArgumentsHost,
    ): Observable<any> {
        console.log('rcp exception filter');
        
        const _data = host.switchToRpc().getData();
        const data = _data.value;
        const meta = _data.headers;
        const path = _data.topic;

        let error_data = {} as any;
        let status_code = 500;

        if (exception instanceof HttpException) {
            error_data = exception.getResponse();
            status_code = exception.getStatus();
        }

        const error = new Error();
        error.name = exception.name;
        error.message = JSON.stringify({
            context: 'workorder',
            code: status_code,
            message: exception.message,
            stack: exception.stack,
            error_data,
        });
        error.stack = exception.stack;

        

        return   of(genCurrentDate()) 
    }
}