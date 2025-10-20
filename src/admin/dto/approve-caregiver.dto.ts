import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveCaregiverDto {
  @ApiProperty({ example: 'caregiver_123' })
  @IsString()
  caregiverId: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  approved: boolean;

  @ApiProperty({ 
    example: 'Profile meets all requirements',
    required: false 
  })
  @IsOptional()
  @IsString()
  notes?: string;
}