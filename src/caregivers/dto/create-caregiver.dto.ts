import { IsString, IsNumber, IsDecimal, IsArray, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ServiceCategory {
  PERSONAL_CARE = 'personal_care',
  MEDICAL_CARE = 'medical_care',
  COMPANIONSHIP = 'companionship',
  HOUSEHOLD_TASKS = 'household_tasks',
  TRANSPORTATION = 'transportation',
  SPECIALIZED_CARE = 'specialized_care',
}

export class CreateCaregiverDto {
  @ApiProperty({ example: 'user_123' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'Experienced caregiver with 5 years of experience...' })
  @IsString()
  bio: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  experience: number;

  @ApiProperty({ example: 25.50 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hourlyRate: number;

  @ApiProperty({ example: 4.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  rating: number;

  @ApiProperty({ 
    example: ['personal_care', 'companionship'],
    enum: ServiceCategory,
    isArray: true 
  })
  @IsArray()
  @IsString({ each: true })
  services: string[];

  @ApiProperty({ 
    example: [
      { name: 'CPR Certification', issuingBody: 'Red Cross', issueDate: '2023-01-01' }
    ],
    required: false 
  })
  @IsOptional()
  @IsArray()
  certifications?: {
    name: string;
    issuingBody: string;
    issueDate: string;
    expiryDate?: string;
  }[];

  @ApiProperty({ 
    example: [
      { dayOfWeek: 'monday', startTime: '09:00', endTime: '17:00' }
    ],
    required: false 
  })
  @IsOptional()
  @IsArray()
  availability?: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
}