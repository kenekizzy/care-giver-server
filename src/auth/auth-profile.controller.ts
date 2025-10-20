import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserRole } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuthProfileController {
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentUser() user: User): User {
    return user;
  }

  @Get('admin-only')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin only endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Admin data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  getAdminData(@CurrentUser() user: User): { message: string; user: User } {
    return {
      message: 'This is admin-only data',
      user,
    };
  }

  @Get('caregiver-only')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CAREGIVER)
  @ApiOperation({ summary: 'Caregiver only endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Caregiver data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Caregiver role required' })
  getCaregiverData(@CurrentUser() user: User): { message: string; user: User } {
    return {
      message: 'This is caregiver-only data',
      user,
    };
  }
}