import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdminRole } from '../entities/admin.entity';

export class CreateAdminDto {
  @ApiProperty({ example: 'user_123' })
  @IsString()
  userId: string;

  @ApiProperty({ enum: AdminRole, example: AdminRole.ADMIN })
  @IsEnum(AdminRole)
  role: AdminRole;

  @ApiProperty({ 
    example: ['caregiver_approval', 'user_management'],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}