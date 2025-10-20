import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({ example: 'user@gmail.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'https://lh3.googleusercontent.com/...' })
  avatar?: string;

  @ApiProperty({ example: '1234567890' })
  googleId: string;
}