import { BadRequestException } from "@nestjs/common";
import { validate } from 'class-validator';

export async function isValidFormData<T>(obj: object,labelOfBody:string,type:any):Promise<T>{
  const temp = new type();
  Object.assign(temp,JSON.parse(obj[labelOfBody]));
  const errors = await validate(temp);

  if(errors.length > 0){
    throw new BadRequestException(errors.toString());
  }
  return temp;
}

export async function isValidObject<T>(obj: object,type:any):Promise<T>{
  const objByType = new type();
  Object.assign(objByType,obj);
  const errors = await validate(objByType);

  if(errors.length > 0){
    throw new BadRequestException(errors.toString());
  }

  return objByType;
}