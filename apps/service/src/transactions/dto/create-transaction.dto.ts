import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: 'uuid-of-category', description: 'Category UUID (must belong to the user)' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: 150000, description: 'Amount in VND (positive integer)' })
  @IsInt()
  @Min(1)
  amount!: number;

  @ApiProperty({ example: '2026-09-01', description: 'Transaction date in YYYY-MM-DD (local date from client)' })
  @IsDateString()
  transactionDate!: string;

  @ApiPropertyOptional({ example: 'Lunch at Pho 24', description: 'Optional note (max 200 chars)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
