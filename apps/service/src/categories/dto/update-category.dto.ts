import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CategoryTypeEnum } from '@myspend/libs';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Ăn uống', description: 'New category name (max 100 chars)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ enum: CategoryTypeEnum, description: 'Category type (can only be updated if no transactions exist)' })
  @IsOptional()
  @IsEnum(CategoryTypeEnum)
  type?: CategoryTypeEnum;

  @ApiPropertyOptional({ example: 'shopping-bag', description: 'New icon slug (max 50 chars)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}
