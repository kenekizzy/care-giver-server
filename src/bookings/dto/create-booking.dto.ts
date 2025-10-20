import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'user_123' })
  @IsString()
  clientId: string;

  @ApiProperty({ example: 'caregiver_456' })
  @IsString()
  caregiverId: string;

  @ApiProperty({ example: 'service_123' })
  @IsString()
  serviceId: string;

  @ApiProperty({ example: '2024-01-25T00:00:00.000Z' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ example: '09:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ example: '13:00' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ example: 240 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @ApiProperty({ example: 25.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiProperty({ example: 100.0 })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ example: '123 Main St, New York, NY 10001' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    example: 'Help with morning routine and medication',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;
}
