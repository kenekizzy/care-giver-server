import { ApiProperty } from '@nestjs/swagger';
import { ServiceCategory } from '../dto/create-service.dto';

export class Service {
  @ApiProperty({ example: 'service_123' })
  id: string;

  @ApiProperty({ example: 'Personal Care Assistance' })
  name: string;

  @ApiProperty({
    example:
      'Help with daily personal care activities including bathing, dressing, and grooming',
  })
  description: string;

  @ApiProperty({
    enum: ServiceCategory,
    example: ServiceCategory.PERSONAL_CARE,
  })
  category: ServiceCategory;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
