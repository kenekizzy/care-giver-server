import { ApiProperty } from '@nestjs/swagger';

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export class Admin {
  @ApiProperty({ example: 'admin_123' })
  id: string;

  @ApiProperty({ example: 'user_123' })
  userId: string;

  @ApiProperty({ enum: AdminRole, example: AdminRole.ADMIN })
  role: AdminRole;

  @ApiProperty({ example: ['caregiver_approval', 'user_management'] })
  permissions: string[];

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}