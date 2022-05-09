import { i18nValidationMessage } from 'nestjs-i18n';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * NotEmptyMessage with i18N
 *
 * isNotEmptyWithI18nMessage('greet.NOT_EMPTY')
 * greet is a file which contains all i18nMessages
 * NotEmpty is a key in greet file
 */
export function IsNotEmptyWithI18nMessage(i18FileWithKey: string) {
  return IsNotEmpty({
    message: i18nValidationMessage(i18FileWithKey),
  });
}

export function IsStringWithI18nMessage(i18FileWithKey: string) {
  return IsString({ message: i18nValidationMessage(i18FileWithKey) });
}

export function LengthWithI18nMessage(
  i18FileWithKey: string,
  min: number,
  max?: number,
) {
  return Length(min, max, { message: i18nValidationMessage(i18FileWithKey) });
}

export function IsEnumWithI18nMessage(entity: object, i18FileWithKey: string) {
  return IsEnum(entity, { message: i18nValidationMessage(i18FileWithKey) });
}
