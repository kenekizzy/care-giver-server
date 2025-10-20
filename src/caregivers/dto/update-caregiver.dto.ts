import { PartialType } from '@nestjs/mapped-types';
import { CreateCaregiverDto } from './create-caregiver.dto';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCaregiverDto extends PartialType(CreateCaregiverDto) {
  @ApiProperty({ example: 25, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reviewCount?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isVerified?: boolean;
  bio: undefined;
  experience: undefined;
  hourlyRate: undefined;
}
