import { ApiProperty } from '@nestjs/swagger';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class Booking {
  @ApiProperty({ example: 'booking_123' })
  id: string;

  @ApiProperty({ example: 'user_123' })
  clientId: string;

  @ApiProperty({ example: 'caregiver_456' })
  caregiverId: string;

  @ApiProperty({
    example: ['Personal Care', 'Companionship'],
    type: [String],
  })
  services: string[];

  @ApiProperty({ example: '2024-01-25' })
  date: string;

  @ApiProperty({ example: '09:00' })
  startTime: string;

  @ApiProperty({ example: '13:00' })
  endTime: string;

  @ApiProperty({ example: 4 })
  duration: number;

  @ApiProperty({ example: 25 })
  hourlyRate: number;

  @ApiProperty({ example: 100 })
  totalAmount: number;

  @ApiProperty({ example: '123 Main St, New York, NY 10001' })
  location: string;

  @ApiProperty({
    example: 'Help with morning routine and medication',
    required: false,
  })
  notes?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  emergencyContactName?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  emergencyContactPhone?: string;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.PENDING })
  status: BookingStatus;

  @ApiProperty({ example: '2024-01-20T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-20T10:30:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: '2024-01-25T09:00:00.000Z', required: false })
  confirmedAt?: Date;

  @ApiProperty({ example: '2024-01-25T13:00:00.000Z', required: false })
  completedAt?: Date;
}
