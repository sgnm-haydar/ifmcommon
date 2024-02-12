import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v4: uuidv4 } = require('uuid');
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
