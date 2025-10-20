import { PartialType } from '@nestjs/swagger';
import { CreateBookingDto } from './create-booking.dto';
import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @ApiProperty({
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED,
    required: false,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiProperty({ example: '2024-01-25T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiProperty({ example: '09:00', required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ example: '13:00', required: false })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ example: 240, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @ApiProperty({ example: 25.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiProperty({ example: 100.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiProperty({ example: '123 Main St, New York, NY 10001', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}
