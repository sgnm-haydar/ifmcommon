import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { genCurrentDate } from '../func/generate.new.date';
/**
 * Base object for entities whic inherit mongoose document meytods
 */
export abstract class BasePersistantDocumentObject extends Document {
  /**
   * Uuid for uniqeness
   */
  @Prop({
    type: String,
    default: function genUUID() {
      return uuidv4();
    },
  })
  uuid: string;
  @Prop({
    type: Date,
    default: genCurrentDate(),
  })
  createdAt: Date;

  @Prop({
    type: Date,
    default: genCurrentDate(),
  })
  updatedAt: Date;
  /**
   * isActive
   */
  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;
  /**
   * isDeleted
   */
  @Prop({
    type: Boolean,
    default: false,
  })
  isDeleted: boolean;
}
