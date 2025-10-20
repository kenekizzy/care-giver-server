import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class HealthService {
  constructor(private readonly databaseService: DatabaseService) {}

  async check() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkMemory(),
      this.checkDisk(),
    ]);

    const results = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: checks[0].status === 'fulfilled' ? checks[0].value : { status: 'error', error: (checks[0] as PromiseRejectedResult).reason },
        memory: checks[1].status === 'fulfilled' ? checks[1].value : { status: 'error', error: (checks[1] as PromiseRejectedResult).reason },
        disk: checks[2].status === 'fulfilled' ? checks[2].value : { status: 'error', error: (checks[2] as PromiseRejectedResult).reason },
      },
    };

    // Determine overall status
    const hasErrors = Object.values(results.checks).some(check => check.status === 'error');
    if (hasErrors) {
      results.status = 'error';
    }

    return results;
  }

  async readiness() {
    try {
      await this.checkDatabase();
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  async liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  private async checkDatabase() {
    try {
      await this.databaseService.$queryRaw`SELECT 1`;
      return { status: 'ok', responseTime: Date.now() };
    } catch (error) {
      throw new Error(`Database check failed: ${error.message}`);
    }
  }

  private async checkMemory() {
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal;
    const usedMemory = memUsage.heapUsed;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    return {
      status: memoryUsagePercent > 90 ? 'warning' : 'ok',
      usage: {
        total: totalMemory,
        used: usedMemory,
        percentage: Math.round(memoryUsagePercent * 100) / 100,
      },
    };
  }

  private async checkDisk() {
    // Simple disk check - in production you might want to use a more sophisticated check
    try {
      const fs = require('fs');
      const stats = fs.statSync('.');
      return {
        status: 'ok',
        accessible: true,
      };
    } catch (error) {
      throw new Error(`Disk check failed: ${error.message}`);
    }
  }
}