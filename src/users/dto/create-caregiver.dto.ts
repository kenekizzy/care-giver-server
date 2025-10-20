import {
  IsArray,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class CreateCaregiverDto extends CreateUserDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsOfExperience: number;

  @ApiProperty({ example: 25 })
  @IsNumber()
  @Min(10)
  @Max(100)
  hourlyRate: number;

  @ApiProperty({ 
    example: ['Personal Care', 'Companionship', 'Medication Management'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  services: string[];

  @ApiProperty({ 
    example: ['CPR Certified', 'First Aid', 'CNA License'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  certifications: string[];

  @ApiProperty({ 
    example: ['English', 'Spanish'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @ApiProperty({ example: 'Experienced caregiver with 5 years of experience in elderly care.' })
  @IsString()
  bio: string;

  @ApiProperty({ example: 'Full-time' })
  @IsString()
  availability: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  backgroundCheckCompleted: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  hasInsurance: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  hasTransportation: boolean;

  @ApiProperty({ example: 'Usually responds within 2 hours', required: false })
  @IsOptional()
  @IsString()
  responseTime?: string;

  @ApiProperty({ 
    example: {
      monday: { available: true, slots: ['9:00 AM', '2:00 PM', '6:00 PM'] },
      tuesday: { available: true, slots: ['10:00 AM', '3:00 PM'] },
      wednesday: { available: true, slots: ['9:00 AM', '1:00 PM', '5:00 PM'] },
      thursday: { available: false, slots: [] },
      friday: { available: true, slots: ['11:00 AM', '4:00 PM'] },
      saturday: { available: true, slots: ['10:00 AM', '2:00 PM'] },
      sunday: { available: false, slots: [] }
    },
    required: false
  })
  @IsOptional()
  schedule?: Record<string, { available: boolean; slots: string[] }>;
}