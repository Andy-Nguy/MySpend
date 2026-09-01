import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength } from 'class-validator';
import { CategoryTypeEnum } from '@myspend/libs';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Ăn uống', description: 'Category name (max 100 chars)' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ enum: CategoryTypeEnum, description: 'Category type: income or expense' })
  @IsEnum(CategoryTypeEnum)
  type!: CategoryTypeEnum;

  @ApiProperty({ example: 'fork-knife', description: 'Icon slug (lucide-react name, max 50 chars)' })
  @IsString()
  @MaxLength(50)
  icon!: string;
}
