import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ServiceCategory {
  PERSONAL_CARE = 'personal_care',
  MEDICAL_CARE = 'medical_care',
  COMPANIONSHIP = 'companionship',
  HOUSEHOLD_TASKS = 'household_tasks',
  TRANSPORTATION = 'transportation',
  SPECIALIZED_CARE = 'specialized_care',
}

export class CreateServiceDto {
  @ApiProperty({ example: 'Personal Care Assistance' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Help with daily personal care activities including bathing, dressing, and grooming' })
  @IsString()
  description: string;

  @ApiProperty({ enum: ServiceCategory, example: ServiceCategory.PERSONAL_CARE })
  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
