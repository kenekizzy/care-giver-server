import { UserRole } from 'src/users/dto/create-user.dto';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
