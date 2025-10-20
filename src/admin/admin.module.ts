import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CaregiversModule } from '../caregivers/caregivers.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [CaregiversModule, DatabaseModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}