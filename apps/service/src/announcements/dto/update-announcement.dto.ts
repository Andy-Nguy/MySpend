import {
  AnnouncementPriorityEnum,
  AnnouncementTypeEnum,
  IUpdateAnnouncementDto,
} from '@myspend/libs';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateAnnouncementDto implements IUpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  version?: string;

  @IsOptional()
  @IsEnum(AnnouncementTypeEnum)
  type?: AnnouncementTypeEnum;

  @IsOptional()
  @IsEnum(AnnouncementPriorityEnum)
  priority?: AnnouncementPriorityEnum;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPopup?: boolean;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
