import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TransforLabelsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<string> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const query = request.query;

    const keys = Object.keys(query);
    for (let index = 0; index < keys.length; index++) {
      let labelArray = [];

      if (keys[index].startsWith('label')) {
        if (typeof query[keys[index]] === 'string') {
          labelArray.push(query[keys[index]]);

          query[keys[index]] = labelArray;
        } else {
          labelArray = query[keys[index]];
        }
      }
    }
    return next.handle();
  }
}
