import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      message: 'MySpend Service is running',
      timestamp: new Date().toISOString(),
    };
  }
}
