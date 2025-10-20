/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Caregiver } from './entities/caregiver.entity';
import { DatabaseService } from '../database/database.service';
import { UserRole as PrismaUserRole } from 'generated/prisma';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapUserRoleToEnum(role: UserRole): PrismaUserRole {
    switch (role) {
      case UserRole.ADMIN:
        return PrismaUserRole.ADMIN;
      case UserRole.CLIENT:
        return PrismaUserRole.CLIENT;
      case UserRole.CAREGIVER:
        return PrismaUserRole.CAREGIVER;
      default:
        return PrismaUserRole.CLIENT;
    }
  }

  private mapPrismaUserToEntity(prismaUser: any): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      phone: prismaUser.phone,
      role: prismaUser.role.toLowerCase() as UserRole,
      isVerified: prismaUser.isVerified,
      status: 'active', // Default status
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      lastLoginAt: prismaUser.lastLoginAt,
    };
  }

  private mapPrismaCaregiverToEntity(prismaUser: any): Caregiver {
    const baseUser = this.mapPrismaUserToEntity(prismaUser);
    const profile = prismaUser.caregiverProfile;

    return {
      ...baseUser,
      yearsOfExperience: profile?.experience || 0,
      hourlyRate: profile?.hourlyRate ? Number(profile.hourlyRate) : 0,
      services: profile?.services?.map((s: any) => s.service.name) || [],
      certifications: profile?.certifications?.map((c: any) => c.name) || [],
      languages: ['English'], // Default
      bio: profile?.bio || '',
      availability: 'Full-time', // Default
      backgroundCheckCompleted: true,
      hasInsurance: true,
      hasTransportation: true,
      rating: profile?.rating ? Number(profile.rating) : 0,
      reviewCount: profile?.reviewCount || 0,
      completedJobs: 0, // Would need to calculate from bookings
      repeatClientPercentage: 0, // Would need to calculate
      responseTime: 'Usually responds within 2 hours',
      approvalStatus: profile?.isVerified ? 'approved' : 'pending',
      schedule: {}, // Would need to map from availability slots
    };
  }

  async findAll(): Promise<User[]> {
    const prismaUsers = await this.databaseService.user.findMany();
    return prismaUsers.map((user) => this.mapPrismaUserToEntity(user));
  }

  async findAllCaregivers(filters?: {
    services?: string[];
    location?: string;
    minRating?: number;
    maxHourlyRate?: number;
    availability?: string;
  }): Promise<Caregiver[]> {
    const whereClause: any = {
      role: PrismaUserRole.CAREGIVER,
      caregiverProfile: {
        isVerified: true,
      },
    };

    if (filters?.minRating) {
      whereClause.caregiverProfile.rating = {
        gte: filters.minRating,
      };
    }

    if (filters?.maxHourlyRate) {
      whereClause.caregiverProfile.hourlyRate = {
        lte: filters.maxHourlyRate,
      };
    }

    const prismaUsers = await this.databaseService.user.findMany({
      where: whereClause,
      include: {
        caregiverProfile: {
          include: {
            services: {
              include: {
                service: true,
              },
            },
            certifications: true,
          },
        },
      },
    });

    return prismaUsers.map((user) => this.mapPrismaCaregiverToEntity(user));
  }

  async findOne(id: string): Promise<User> {
    const prismaUser = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!prismaUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapPrismaUserToEntity(prismaUser);
  }

  async findCaregiver(id: string): Promise<Caregiver> {
    const prismaUser = await this.databaseService.user.findUnique({
      where: {
        id,
        role: PrismaUserRole.CAREGIVER,
      },
      include: {
        caregiverProfile: {
          include: {
            services: {
              include: {
                service: true,
              },
            },
            certifications: true,
          },
        },
      },
    });

    if (!prismaUser) {
      throw new NotFoundException(`Caregiver with ID ${id} not found`);
    }

    return this.mapPrismaCaregiverToEntity(prismaUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.databaseService.user.findUnique({
      where: { email },
    });

    return prismaUser ? this.mapPrismaUserToEntity(prismaUser) : null;
  }

  async findUsersByRole(role: UserRole): Promise<User[]> {
    const prismaUsers = await this.databaseService.user.findMany({
      where: { role: this.mapUserRoleToEnum(role) },
    });

    return prismaUsers.map((user) => this.mapPrismaUserToEntity(user));
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const prismaUser = await this.databaseService.user.update({
      where: { id },
      data: {
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        phone: updateUserDto.phone,
        // isVerified is not part of UpdateUserDto
      },
    });

    return this.mapPrismaUserToEntity(prismaUser);
  }

  async remove(id: string): Promise<void> {
    await this.databaseService.user.delete({
      where: { id },
    });
  }

  async verifyEmail(id: string): Promise<User> {
    const prismaUser = await this.databaseService.user.update({
      where: { id },
      data: { isVerified: true },
    });

    return this.mapPrismaUserToEntity(prismaUser);
  }

  async updateLastLogin(id: string): Promise<User> {
    const prismaUser = await this.databaseService.user.update({
      where: { id },
      data: { updatedAt: new Date() }, // Using updatedAt as lastLoginAt equivalent
    });

    return this.mapPrismaUserToEntity(prismaUser);
  }

  async approveCaregiver(id: string): Promise<Caregiver> {
    const prismaUser = await this.databaseService.user.update({
      where: { id },
      data: {
        caregiverProfile: {
          update: {
            isVerified: true,
          },
        },
      },
      include: {
        caregiverProfile: {
          include: {
            services: {
              include: {
                service: true,
              },
            },
            certifications: true,
          },
        },
      },
    });

    return this.mapPrismaCaregiverToEntity(prismaUser);
  }

  async rejectCaregiver(id: string): Promise<Caregiver> {
    const prismaUser = await this.databaseService.user.update({
      where: { id },
      data: {
        caregiverProfile: {
          update: {
            isVerified: false,
          },
        },
      },
      include: {
        caregiverProfile: {
          include: {
            services: {
              include: {
                service: true,
              },
            },
            certifications: true,
          },
        },
      },
    });

    return this.mapPrismaCaregiverToEntity(prismaUser);
  }

  async getDashboardStats(userId: string): Promise<any> {
    const user = await this.findOne(userId);

    if (user.role === UserRole.CLIENT) {
      const completedBookings = await this.databaseService.booking.count({
        where: {
          clientId: userId,
          status: 'COMPLETED',
        },
      });

      const upcomingBookings = await this.databaseService.booking.count({
        where: {
          clientId: userId,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      const totalSpent = await this.databaseService.booking.aggregate({
        where: {
          clientId: userId,
          status: 'COMPLETED',
        },
        _sum: {
          totalAmount: true,
        },
      });

      return {
        totalBookings: completedBookings + upcomingBookings,
        totalSpent: Number(totalSpent._sum.totalAmount) || 0,
        upcomingBookings,
        completedBookings,
      };
    } else if (user.role === UserRole.CAREGIVER) {
      const caregiver = await this.findCaregiver(userId);

      const totalEarnings = await this.databaseService.booking.aggregate({
        where: {
          caregiverId: userId,
          status: 'COMPLETED',
        },
        _sum: {
          totalAmount: true,
        },
      });

      const monthlyBookings = await this.databaseService.booking.count({
        where: {
          caregiverId: userId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      });

      return {
        totalEarnings: Number(totalEarnings._sum.totalAmount) || 0,
        monthlyBookings,
        averageRating: caregiver.rating,
        completedJobs: caregiver.completedJobs,
        responseRate: 98,
        activeClients: 12, // Would need complex query to calculate
      };
    } else if (user.role === UserRole.ADMIN) {
      const totalUsers = await this.databaseService.user.count();
      const totalCaregivers = await this.databaseService.user.count({
        where: { role: PrismaUserRole.CAREGIVER },
      });
      const totalBookings = await this.databaseService.booking.count();
      const pendingApprovals = await this.databaseService.user.count({
        where: {
          role: PrismaUserRole.CAREGIVER,
          caregiverProfile: {
            isVerified: false,
          },
        },
      });
      const activeBookings = await this.databaseService.booking.count({
        where: { status: { in: ['CONFIRMED', 'IN_PROGRESS'] } },
      });
      const totalRevenue = await this.databaseService.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true },
      });

      return {
        totalUsers,
        totalCaregivers,
        totalBookings,
        pendingApprovals,
        activeBookings,
        totalRevenue: Number(totalRevenue._sum.totalAmount) || 0,
      };
    }

    return {};
  }

  // Profile update methods
  async updateProfile(
    id: string,
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
    const prismaUser = await this.databaseService.user.update({
      where: { id },
      data: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        phone: updateData.phone,
        // Note: address fields would need to be added to the User schema
        // For now, we'll store them as JSON in a metadata field or add them to schema
      },
    });

    return this.mapPrismaUserToEntity(prismaUser);
  }

  async updateCaregiverProfile(
    id: string,
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
    // First check if caregiver profile exists
    const existingProfile =
      await this.databaseService.caregiverProfile.findUnique({
        where: { userId: id },
      });

    if (!existingProfile) {
      throw new NotFoundException('Caregiver profile not found');
    }

    // Update basic profile data
    const updateProfileData: any = {};
    if (updateData.bio !== undefined) updateProfileData.bio = updateData.bio;
    if (updateData.experience !== undefined)
      updateProfileData.experience = updateData.experience;
    if (updateData.hourlyRate !== undefined)
      updateProfileData.hourlyRate = updateData.hourlyRate;

    const updatedProfile = await this.databaseService.caregiverProfile.update({
      where: { userId: id },
      data: updateProfileData,
    });

    if (updateData.services) {
      await this.databaseService.caregiverService.deleteMany({
        where: { caregiverId: updatedProfile.id },
      });

      // Add new services
      for (const serviceName of updateData.services) {
        // Find or create service
        let service = await this.databaseService.service.findUnique({
          where: { id: serviceName }, // Assuming serviceName is actually serviceId
        });

        if (!service) {
          // If not found by ID, try to find by name or create new
          service = await this.databaseService.service.findFirst({
            where: { name: serviceName },
          });

          if (!service) {
            service = await this.databaseService.service.create({
              data: {
                name: serviceName,
                description: serviceName,
                category: 'PERSONAL_CARE', // Default category - adjust as needed
                isActive: true,
              },
            });
          }
        }

        // Link service to caregiver
        await this.databaseService.caregiverService.create({
          data: {
            caregiverId: updatedProfile.id,
            serviceId: service.id,
          },
        });
      }
    }

    // Update certifications if provided
    if (updateData.certifications) {
      // Remove existing certifications
      await this.databaseService.certification.deleteMany({
        where: { caregiverId: updatedProfile.id },
      });

      // Add new certifications
      for (const cert of updateData.certifications) {
        await this.databaseService.certification.create({
          data: {
            caregiverId: updatedProfile.id,
            name: cert.name,
            issuedBy: cert.issuedBy || '',
            issuedDate: cert.issuedDate
              ? new Date(cert.issuedDate)
              : new Date(),
            expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
            isVerified: cert.isVerified || false,
          },
        });
      }
    }

    // Return updated profile with relations
    return this.getCaregiverProfile(id);
  }

  async createCaregiverProfile(
    id: string,
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
    // Check if user exists and is a caregiver
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'CAREGIVER') {
      throw new BadRequestException('User must have CAREGIVER role');
    }

    // Check if caregiver profile already exists
    const existingProfile =
      await this.databaseService.caregiverProfile.findUnique({
        where: { userId: id },
      });

    if (existingProfile) {
      throw new ConflictException('Caregiver profile already exists');
    }

    // Create caregiver profile
    const caregiverProfile = await this.databaseService.caregiverProfile.create(
      {
        data: {
          userId: id,
          bio: profileData.bio,
          experience: profileData.experience,
          hourlyRate: profileData.hourlyRate,
          rating: 5.0, // Default rating
          reviewCount: 0,
          isVerified: false, // Requires admin approval
        },
      },
    );

    // Add services
    for (const serviceName of profileData.services) {
      // Find or create service
      let service = await this.databaseService.service.findFirst({
        where: { name: serviceName },
      });

      if (!service) {
        service = await this.databaseService.service.create({
          data: {
            name: serviceName,
            description: serviceName,
            category: 'PERSONAL_CARE', // Default category - adjust as needed
            isActive: true,
          },
        });
      }

      // Link service to caregiver
      await this.databaseService.caregiverService.create({
        data: {
          caregiverId: caregiverProfile.id,
          serviceId: service.id,
        },
      });
    }

    // Add certifications if provided
    if (profileData.certifications) {
      for (const cert of profileData.certifications) {
        await this.databaseService.certification.create({
          data: {
            caregiverId: caregiverProfile.id,
            name: cert.name,
            issuedBy: cert.issuedBy || '',
            issuedDate: cert.issuedDate
              ? new Date(cert.issuedDate)
              : new Date(),
            expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
            isVerified: false, // Requires verification
          },
        });
      }
    }

    return this.getCaregiverProfile(id);
  }

  async getCaregiverProfile(id: string): Promise<any> {
    const caregiverProfile =
      await this.databaseService.caregiverProfile.findUnique({
        where: { userId: id },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              isVerified: true,
            },
          },
          services: {
            include: {
              service: true,
            },
          },
          certifications: true,
        },
      });

    if (!caregiverProfile) {
      throw new NotFoundException('Caregiver profile not found');
    }

    return {
      id: caregiverProfile.id,
      userId: caregiverProfile.userId,
      user: caregiverProfile.user,
      bio: caregiverProfile.bio,
      experience: caregiverProfile.experience,
      hourlyRate: Number(caregiverProfile.hourlyRate),
      rating: Number(caregiverProfile.rating),
      reviewCount: caregiverProfile.reviewCount,
      isVerified: caregiverProfile.isVerified,
      services: caregiverProfile.services.map((s) => ({
        id: s.service.id,
        name: s.service.name,
      })),
      certifications: caregiverProfile.certifications.map((c) => ({
        id: c.id,
        name: c.name,
        issuedBy: c.issuedBy,
        issuedDate: c.issuedDate,
        expiryDate: c.expiryDate,
        isVerified: c.isVerified,
      })),
      createdAt: caregiverProfile.createdAt,
      updatedAt: caregiverProfile.updatedAt,
    };
  }

  async updatePreferences(
    id: string,
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
    // For now, we'll store preferences as JSON in the user table
    // In a production app, you might want a separate preferences table
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mock implementation - would need to add preferences field to user schema
    return {
      userId: id,
      preferences,
      updatedAt: new Date(),
    };
  }

  async getPreferences(id: string): Promise<any> {
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Mock implementation - return default preferences
    return {
      userId: id,
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      privacy: {
        profileVisibility: 'public',
        showPhone: false,
        showEmail: false,
      },
      carePreferences: {
        preferredGender: 'no-preference',
        preferredLanguages: ['English'],
        specialNeeds: [],
      },
    };
  }

  async uploadAvatar(
    id: string,
    avatarUrl: string,
  ): Promise<{ avatarUrl: string }> {
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In a real implementation, you would:
    // 1. Validate the uploaded file
    // 2. Store it in cloud storage (AWS S3, etc.)
    // 3. Update the user record with the new avatar URL

    // For now, we'll just return the provided URL
    return { avatarUrl };
  }

  async deleteCaregiverProfile(id: string): Promise<void> {
    const caregiverProfile =
      await this.databaseService.caregiverProfile.findUnique({
        where: { userId: id },
      });

    if (!caregiverProfile) {
      throw new NotFoundException('Caregiver profile not found');
    }

    // Delete related records first
    await this.databaseService.caregiverService.deleteMany({
      where: { caregiverId: caregiverProfile.id },
    });

    await this.databaseService.certification.deleteMany({
      where: { caregiverId: caregiverProfile.id },
    });

    // Delete the profile
    await this.databaseService.caregiverProfile.delete({
      where: { id: caregiverProfile.id },
    });
  }

  async updatePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.passwordHash) {
      throw new BadRequestException(
        'This account was created with social login. Password cannot be changed.',
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.databaseService.user.update({
      where: { id },
      data: { passwordHash: hashedNewPassword },
    });

    return { message: 'Password updated successfully' };
  }
}
