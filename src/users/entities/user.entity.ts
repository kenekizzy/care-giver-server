import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../dto/create-user.dto';

export class User {
  @ApiProperty({ example: 'cuid123' })
  id: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: '+1234567890', required: false })
  phone?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CLIENT })
  role: UserRole;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty({ example: '/avatars/user.jpg', required: false })
  avatar?: string;

  @ApiProperty({ example: '123 Main St, New York, NY 10001', required: false })
  address?: string;

  @ApiProperty({ example: 'New York', required: false })
  city?: string;

  @ApiProperty({ example: 'NY', required: false })
  state?: string;

  @ApiProperty({ example: '10001', required: false })
  zipCode?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  dateOfBirth?: string;

  @ApiProperty({ example: 'male', required: false })
  gender?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  emergencyContactName?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  emergencyContactPhone?: string;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', required: false })
  lastLoginAt?: Date;
}
