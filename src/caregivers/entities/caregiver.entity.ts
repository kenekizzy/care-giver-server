import { ApiProperty } from '@nestjs/swagger';

export class Caregiver {
  @ApiProperty({ example: 'caregiver_123' })
  id: string;

  @ApiProperty({ example: 'user_123' })
  userId: string;

  @ApiProperty({ example: 'Experienced caregiver with 5 years of experience...' })
  bio: string;

  @ApiProperty({ example: 5 })
  experience: number;

  @ApiProperty({ example: 25.50 })
  hourlyRate: number;

  @ApiProperty({ example: 4.5, required: false })
  rating?: number;

  @ApiProperty({ example: 25 })
  reviewCount: number;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty({ example: ['personal_care', 'companionship'] })
  services: string[];

  @ApiProperty({ 
    example: [
      { 
        name: 'CPR Certification', 
        issuingBody: 'Red Cross', 
        issueDate: '2023-01-01',
        isVerified: true 
      }
    ] 
  })
  certifications: {
    name: string;
    issuingBody: string;
    issueDate: string;
    expiryDate?: string;
    isVerified: boolean;
  }[];

  @ApiProperty({ 
    example: [
      { dayOfWeek: 'monday', startTime: '09:00', endTime: '17:00', isActive: true }
    ] 
  })
  availability: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }[];

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
