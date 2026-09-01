import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, Max, Min } from 'class-validator';
import { Request } from 'express';

import { ReportsService } from './reports.service';

class ReportSummaryQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;
}

class CategoryBreakdownQueryDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}

interface IAuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Monthly income/expense summary and recent transactions' })
  @ApiQuery({ name: 'year', type: Number, example: 2026 })
  @ApiQuery({ name: 'month', type: Number, example: 9 })
  getSummary(@Req() req: IAuthenticatedRequest, @Query() query: ReportSummaryQueryDto) {
    return this.reportsService.getSummary(req.user.userId, query.year, query.month);
  }

  @Get('category-breakdown')
  @ApiOperation({ summary: 'Expense breakdown by category for a date range' })
  @ApiQuery({ name: 'from', type: String, example: '2026-09-01' })
  @ApiQuery({ name: 'to', type: String, example: '2026-09-30' })
  getCategoryBreakdown(
    @Req() req: IAuthenticatedRequest,
    @Query() query: CategoryBreakdownQueryDto
  ) {
    return this.reportsService.getCategoryBreakdown(req.user.userId, query.from, query.to);
  }
}
