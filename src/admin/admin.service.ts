/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApproveCaregiverDto } from './dto/approve-caregiver.dto';
import { Admin, AdminRole } from './entities/admin.entity';
import { CaregiversService } from '../caregivers/caregivers.service';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly caregiversService: CaregiversService,
    private readonly databaseService: DatabaseService,
  ) {}

  // Helper method to map database admin to entity
  private mapDatabaseAdminToEntity(dbAdmin: any): Admin {
    return {
      id: dbAdmin.id,
      userId: dbAdmin.userId,
      role: dbAdmin.role as AdminRole,
      permissions: dbAdmin.permissions || [],
      isActive: dbAdmin.isActive,
      createdAt: dbAdmin.createdAt,
      updatedAt: dbAdmin.updatedAt,
    };
  }

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    // Check if admin profile already exists for this user
    const existingAdmin = await this.databaseService.user.findUnique({
      where: {
        id: createAdminDto.userId,
        role: 'ADMIN',
      },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin profile already exists for this user');
    }

    // Verify user exists and update role to ADMIN
    const user = await this.databaseService.user.findUnique({
      where: { id: createAdminDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user role to ADMIN
    const updatedUser = await this.databaseService.user.update({
      where: { id: createAdminDto.userId },
      data: { role: 'ADMIN' },
    });

    const defaultPermissions = this.getDefaultPermissions(createAdminDto.role);

    // For now, we'll store admin metadata in user record or create a separate admin table
    // Since we don't have an admin table in the schema, we'll use the user record
    const admin: Admin = {
      id: updatedUser.id,
      userId: updatedUser.id,
      role: createAdminDto.role,
      permissions: createAdminDto.permissions || defaultPermissions,
      isActive: true,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return admin;
  }

  private getDefaultPermissions(role: AdminRole): string[] {
    switch (role) {
      case AdminRole.SUPER_ADMIN:
        return [
          'caregiver_approval',
          'user_management',
          'admin_management',
          'system_settings',
        ];
      case AdminRole.ADMIN:
        return ['caregiver_approval', 'user_management'];
      case AdminRole.MODERATOR:
        return ['caregiver_approval'];
      default:
        return [];
    }
  }

  async findAll(): Promise<Admin[]> {
    const adminUsers = await this.databaseService.user.findMany({
      where: { role: 'ADMIN' },
    });

    return adminUsers.map((user) => ({
      id: user.id,
      userId: user.id,
      role: AdminRole.ADMIN, // Default role, could be enhanced with proper admin roles table
      permissions: this.getDefaultPermissions(AdminRole.ADMIN),
      isActive: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  async findOne(id: string): Promise<Admin> {
    const user = await this.databaseService.user.findUnique({
      where: {
        id,
        role: 'ADMIN',
      },
    });

    if (!user) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return {
      id: user.id,
      userId: user.id,
      role: AdminRole.ADMIN,
      permissions: this.getDefaultPermissions(AdminRole.ADMIN),
      isActive: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findByUserId(userId: string): Promise<Admin | null> {
    const user = await this.databaseService.user.findUnique({
      where: {
        id: userId,
        role: 'ADMIN',
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      userId: user.id,
      role: AdminRole.ADMIN,
      permissions: this.getDefaultPermissions(AdminRole.ADMIN),
      isActive: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async update(id: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    const user = await this.databaseService.user.findUnique({
      where: {
        id,
        role: 'ADMIN',
      },
    });

    if (!user) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    // Update user information - only update fields that are provided
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updateAdminDto.firstName !== undefined) {
      updateData.firstName = updateAdminDto.firstName;
    }
    if (updateAdminDto.lastName !== undefined) {
      updateData.lastName = updateAdminDto.lastName;
    }
    if (updateAdminDto.phone !== undefined) {
      updateData.phone = updateAdminDto.phone;
    }

    const updatedUser = await this.databaseService.user.update({
      where: { id },
      data: updateData,
    });

    return {
      id: updatedUser.id,
      userId: updatedUser.id,
      role: AdminRole.ADMIN,
      permissions: this.getDefaultPermissions(AdminRole.ADMIN),
      isActive: updatedUser.isVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async remove(id: string): Promise<void> {
    const user = await this.databaseService.user.findUnique({
      where: {
        id,
        role: 'ADMIN',
      },
    });

    if (!user) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    // Check if this is the last admin
    const adminCount = await this.databaseService.user.count({
      where: { role: 'ADMIN' },
    });

    if (adminCount <= 1) {
      throw new ForbiddenException('Cannot delete the last admin user');
    }

    // Instead of deleting, we'll change the role back to CLIENT
    await this.databaseService.user.update({
      where: { id },
      data: { role: 'CLIENT' },
    });
  }

  // Caregiver approval methods
  async approveCaregiver(
    adminId: string,
    approveCaregiverDto: ApproveCaregiverDto,
  ): Promise<{ success: boolean; message: string }> {
    // Verify admin exists and has permission
    const admin = await this.findOne(adminId);
    if (!admin.permissions.includes('caregiver_approval')) {
      throw new ForbiddenException(
        'Admin does not have caregiver approval permission',
      );
    }

    // Update caregiver verification status in database
    const caregiverProfile =
      await this.databaseService.caregiverProfile.findUnique({
        where: { id: approveCaregiverDto.caregiverId },
      });

    if (!caregiverProfile) {
      throw new NotFoundException('Caregiver profile not found');
    }

    await this.databaseService.caregiverProfile.update({
      where: { id: approveCaregiverDto.caregiverId },
      data: { isVerified: approveCaregiverDto.approved },
    });

    return {
      success: true,
      message: `Caregiver ${approveCaregiverDto.approved ? 'approved' : 'rejected'} successfully`,
    };
  }

  async getPendingCaregivers(adminId: string) {
    // Verify admin has permission
    const admin = await this.findOne(adminId);
    if (!admin.permissions.includes('caregiver_approval')) {
      throw new ForbiddenException(
        'Admin does not have caregiver approval permission',
      );
    }

    const pendingCaregivers =
      await this.databaseService.caregiverProfile.findMany({
        where: { isVerified: false },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true,
            },
          },
          services: {
            include: {
              service: true,
            },
          },
        },
      });

    return pendingCaregivers.map((profile) => ({
      id: profile.id,
      name: `${profile.user.firstName} ${profile.user.lastName}`,
      email: profile.user.email,
      bio: profile.bio,
      experience: profile.experience,
      hourlyRate: Number(profile.hourlyRate),
      services: profile.services.map((s) => s.service.name),
      joinDate: profile.user.createdAt,
      status: 'pending',
    }));
  }

  async getApprovedCaregivers(adminId: string) {
    // Verify admin has permission
    const admin = await this.findOne(adminId);
    if (!admin.permissions.includes('caregiver_approval')) {
      throw new ForbiddenException(
        'Admin does not have caregiver approval permission',
      );
    }

    const approvedCaregivers =
      await this.databaseService.caregiverProfile.findMany({
        where: { isVerified: true },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true,
            },
          },
          services: {
            include: {
              service: true,
            },
          },
        },
      });

    return approvedCaregivers.map((profile) => ({
      id: profile.id,
      name: `${profile.user.firstName} ${profile.user.lastName}`,
      email: profile.user.email,
      bio: profile.bio,
      experience: profile.experience,
      hourlyRate: Number(profile.hourlyRate),
      rating: Number(profile.rating),
      reviewCount: profile.reviewCount,
      services: profile.services.map((s) => s.service.name),
      joinDate: profile.user.createdAt,
      status: 'approved',
    }));
  }

  // Permission management
  async hasPermission(adminId: string, permission: string): Promise<boolean> {
    const admin = await this.findOne(adminId);
    return admin.permissions.includes(permission);
  }

  async addPermission(adminId: string, permission: string): Promise<Admin> {
    const admin = await this.findOne(adminId);
    if (!admin.permissions.includes(permission)) {
      admin.permissions.push(permission);
      admin.updatedAt = new Date();
      // In a real implementation, you'd store permissions in the database
    }
    return admin;
  }

  async removePermission(adminId: string, permission: string): Promise<Admin> {
    const admin = await this.findOne(adminId);
    admin.permissions = admin.permissions.filter((p) => p !== permission);
    admin.updatedAt = new Date();
    // In a real implementation, you'd update permissions in the database
    return admin;
  }
}
