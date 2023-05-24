import { BadRequestException } from "@nestjs/common";
import { validate } from 'class-validator';

export async function isValidFormData(obj: object,labelOfBody:string,type:any){
  const temp = new type();
  Object.assign(temp,JSON.parse(obj[labelOfBody]));
  const errors = await validate(temp);

  if(errors.length > 0){
    throw new BadRequestException(errors.toString());
  }
  return JSON.parse(obj[labelOfBody]);
}

export async function isValidObject(obj: object,type:any){
  const temp = new type();
  Object.assign(temp,obj);
  const errors = await validate(temp);

  if(errors.length > 0){
    throw new BadRequestException(errors.toString());
  }

  return obj;
}
