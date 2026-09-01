import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

// Note: `type` is intentionally omitted — category type cannot be changed after creation (FR-CAT-007 / BR-013).
// Users must delete and recreate if they need a different type.
export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Ăn uống', description: 'New category name (max 100 chars)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'shopping-bag', description: 'New icon slug (max 50 chars)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}
