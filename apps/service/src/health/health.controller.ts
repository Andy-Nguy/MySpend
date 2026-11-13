import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { Public } from '../auth/decorators/public.decorator';

const MAX_MEMORY_HEAP_BYTES = 400 * 1024 * 1024;

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness health check (database & memory)' })
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', MAX_MEMORY_HEAP_BYTES),
    ]);
  }

  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Lightweight liveness check' })
  live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
