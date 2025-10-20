import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Caregiver } from './entities/caregiver.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // User retrieval endpoints
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [User],
  })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  async findAll(@Query('role') role?: UserRole): Promise<User[]> {
    if (role) {
      return this.usersService.findUsersByRole(role);
    }
    return this.usersService.findAll();
  }

  @Get('caregivers')
  @ApiOperation({ summary: 'Get all caregivers with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Caregivers retrieved successfully',
    type: [Caregiver],
  })
  @ApiQuery({ name: 'services', required: false, type: [String] })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'maxHourlyRate', required: false, type: Number })
  @ApiQuery({ name: 'availability', required: false, type: String })
  async findAllCaregivers(
    @Query('services') services?: string[],
    @Query('location') location?: string,
    @Query('minRating') minRating?: number,
    @Query('maxHourlyRate') maxHourlyRate?: number,
    @Query('availability') availability?: string,
  ): Promise<Caregiver[]> {
    const filters = {
      services: services
        ? Array.isArray(services)
          ? services
          : [services]
        : undefined,
      location,
      minRating: minRating ? Number(minRating) : undefined,
      maxHourlyRate: maxHourlyRate ? Number(maxHourlyRate) : undefined,
      availability,
    };
    return this.usersService.findAllCaregivers(filters);
  }

  @Get('caregivers/:id')
  @ApiOperation({ summary: 'Get caregiver by ID' })
  @ApiResponse({
    status: 200,
    description: 'Caregiver retrieved successfully',
    type: Caregiver,
  })
  @ApiResponse({ status: 404, description: 'Caregiver not found' })
  async findCaregiver(@Param('id') id: string): Promise<Caregiver> {
    return this.usersService.findCaregiver(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Get user dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard stats retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getDashboardStats(@Param('id') id: string): Promise<any> {
    return this.usersService.getDashboardStats(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Post(':id/verify-email')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyEmail(@Param('id') id: string): Promise<User> {
    return this.usersService.verifyEmail(id);
  }

  // Caregiver approval endpoints
  @Post('caregivers/:id/approve')
  @ApiOperation({ summary: 'Approve caregiver application' })
  @ApiResponse({
    status: 200,
    description: 'Caregiver approved successfully',
    type: Caregiver,
  })
  @ApiResponse({ status: 404, description: 'Caregiver not found' })
  async approveCaregiver(@Param('id') id: string): Promise<Caregiver> {
    return this.usersService.approveCaregiver(id);
  }

  @Post('caregivers/:id/reject')
  @ApiOperation({ summary: 'Reject caregiver application' })
  @ApiResponse({
    status: 200,
    description: 'Caregiver rejected successfully',
    type: Caregiver,
  })
  @ApiResponse({ status: 404, description: 'Caregiver not found' })
  async rejectCaregiver(@Param('id') id: string): Promise<Caregiver> {
    return this.usersService.rejectCaregiver(id);
  }

  // Profile update endpoints
  @Patch(':id/profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateProfile(
    @Param('id') id: string,
    @Body()
    updateData: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      dateOfBirth?: string;
      gender?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
    },
  ): Promise<User> {
    return this.usersService.updateProfile(id, updateData);
  }

  @Patch(':id/caregiver-profile')
  @ApiOperation({ summary: 'Update caregiver profile' })
  @ApiResponse({
    status: 200,
    description: 'Caregiver profile updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Caregiver profile not found' })
  async updateCaregiverProfile(
    @Param('id') id: string,
    @Body()
    updateData: {
      bio?: string;
      experience?: number;
      hourlyRate?: number;
      services?: string[];
      certifications?: {
        name: string;
        issuedBy?: string;
        issuedDate?: string;
        expiryDate?: string;
        isVerified?: boolean;
      }[];
      availability?: {
        dayOfWeek: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
      }[];
      languages?: string[];
    },
  ): Promise<any> {
    return this.usersService.updateCaregiverProfile(id, updateData);
  }

  @Post(':id/caregiver-profile')
  @ApiOperation({ summary: 'Create caregiver profile for user' })
  @ApiResponse({
    status: 201,
    description: 'Caregiver profile created successfully',
  })
  @ApiResponse({ status: 409, description: 'Caregiver profile already exists' })
  async createCaregiverProfile(
    @Param('id') id: string,
    @Body()
    profileData: {
      bio: string;
      experience: number;
      hourlyRate: number;
      services: string[];
      certifications?: {
        name: string;
        issuedBy?: string;
        issuedDate?: string;
        expiryDate?: string;
      }[];
    },
  ): Promise<any> {
    return this.usersService.createCaregiverProfile(id, profileData);
  }

  @Get(':id/caregiver-profile')
  @ApiOperation({ summary: 'Get caregiver profile by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Caregiver profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Caregiver profile not found' })
  async getCaregiverProfile(@Param('id') id: string): Promise<any> {
    return this.usersService.getCaregiverProfile(id);
  }

  @Patch(':id/preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({
    status: 200,
    description: 'User preferences updated successfully',
  })
  async updatePreferences(
    @Param('id') id: string,
    @Body()
    preferences: {
      notifications?: {
        email?: boolean;
        sms?: boolean;
        push?: boolean;
      };
      privacy?: {
        profileVisibility?: 'public' | 'private';
        showPhone?: boolean;
        showEmail?: boolean;
      };
      carePreferences?: {
        preferredGender?: 'male' | 'female' | 'no-preference';
        preferredLanguages?: string[];
        specialNeeds?: string[];
      };
    },
  ): Promise<any> {
    return this.usersService.updatePreferences(id, preferences);
  }

  @Get(':id/preferences')
  @ApiOperation({ summary: 'Get user preferences' })
  @ApiResponse({
    status: 200,
    description: 'User preferences retrieved successfully',
  })
  async getPreferences(@Param('id') id: string): Promise<any> {
    return this.usersService.getPreferences(id);
  }

  @Post(':id/upload-avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
  })
  async uploadAvatar(
    @Param('id') id: string,
    @Body() avatarData: { avatarUrl: string },
  ): Promise<{ avatarUrl: string }> {
    return this.usersService.uploadAvatar(id, avatarData.avatarUrl);
  }

  @Delete(':id/caregiver-profile')
  @ApiOperation({ summary: 'Delete caregiver profile' })
  @ApiResponse({
    status: 204,
    description: 'Caregiver profile deleted successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCaregiverProfile(@Param('id') id: string): Promise<void> {
    return this.usersService.deleteCaregiverProfile(id);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async updatePassword(
    @Param('id') id: string,
    @Body()
    passwordData: {
      currentPassword: string;
      newPassword: string;
    },
  ): Promise<{ message: string }> {
    return this.usersService.updatePassword(
      id,
      passwordData.currentPassword,
      passwordData.newPassword,
    );
  }
}
