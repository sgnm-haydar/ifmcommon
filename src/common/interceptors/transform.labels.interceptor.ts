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

    if (query['page']) {
      query['skip'] = Math.abs(query['page'] - 1) * query['limit'];
    }

    const keys = Object.keys(query);
    for (let index = 0; index < keys.length; index++) {
      let labelArray = [];
      let orderByColumnArr = [];

      if (keys[index].startsWith('label')) {
        if (typeof query[keys[index]] === 'string') {
          labelArray.push(query[keys[index]]);

          query[keys[index]] = labelArray;
        } else {
          labelArray = query[keys[index]];
        }
      }

      if (keys[index].startsWith('orderByColumn')) {
        if (typeof query[keys[index]] === 'string') {
          console.log(query[keys[index]]);
          orderByColumnArr.push(query[keys[index]]);

          query[keys[index]] = orderByColumnArr;
        } else {
          orderByColumnArr = query[keys[index]];
        }
      }
    }
    return next.handle();
  }
}
