import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export class Caregiver extends User {
  @ApiProperty({ example: 5 })
  yearsOfExperience: number;

  @ApiProperty({ example: 25 })
  hourlyRate: number;

  @ApiProperty({ 
    example: ['Personal Care', 'Companionship', 'Medication Management'],
    type: [String]
  })
  services: string[];

  @ApiProperty({ 
    example: ['CPR Certified', 'First Aid', 'CNA License'],
    type: [String]
  })
  certifications: string[];

  @ApiProperty({ 
    example: ['English', 'Spanish'],
    type: [String]
  })
  languages: string[];

  @ApiProperty({ example: 'Experienced caregiver with 5 years of experience in elderly care.' })
  bio: string;

  @ApiProperty({ example: 'Full-time' })
  availability: string;

  @ApiProperty({ example: true })
  backgroundCheckCompleted: boolean;

  @ApiProperty({ example: true })
  hasInsurance: boolean;

  @ApiProperty({ example: true })
  hasTransportation: boolean;

  @ApiProperty({ example: 4.9 })
  rating: number;

  @ApiProperty({ example: 127 })
  reviewCount: number;

  @ApiProperty({ example: 89 })
  completedJobs: number;

  @ApiProperty({ example: 78 })
  repeatClientPercentage: number;

  @ApiProperty({ example: 'Usually responds within 2 hours', required: false })
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
  schedule?: Record<string, { available: boolean; slots: string[] }>;

  @ApiProperty({ example: 'approved' })
  approvalStatus: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', required: false })
  approvedAt?: Date;
}