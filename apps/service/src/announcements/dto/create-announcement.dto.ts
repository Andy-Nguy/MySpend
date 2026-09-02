import {
  AnnouncementPriorityEnum,
  AnnouncementTypeEnum,
  ICreateAnnouncementDto,
} from '@myspend/libs';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAnnouncementDto implements ICreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  version?: string;

  @IsOptional()
  @IsEnum(AnnouncementTypeEnum)
  type?: AnnouncementTypeEnum = AnnouncementTypeEnum.FEATURE;

  @IsOptional()
  @IsEnum(AnnouncementPriorityEnum)
  priority?: AnnouncementPriorityEnum = AnnouncementPriorityEnum.MEDIUM;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isPopup?: boolean = true;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
