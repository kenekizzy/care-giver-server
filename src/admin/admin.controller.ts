/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApproveCaregiverDto } from './dto/approve-caregiver.dto';
import { Admin } from './entities/admin.entity';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiResponse({
    status: 201,
    description: 'Admin created successfully',
    type: Admin,
  })
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all admin users' })
  @ApiResponse({
    status: 200,
    description: 'List of all admins',
    type: [Admin],
  })
  findAll() {
    return this.adminService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get admin profile by user ID' })
  @ApiResponse({ status: 200, description: 'Admin profile found', type: Admin })
  @ApiResponse({ status: 404, description: 'Admin profile not found' })
  findByUserId(@Param('userId') userId: string) {
    return this.adminService.findByUserId(userId);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current admin profile' })
  @ApiResponse({ status: 200, description: 'Admin profile found', type: Admin })
  @ApiResponse({ status: 404, description: 'Admin profile not found' })
  getProfile(@Query('userId') userId: string) {
    return this.adminService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiResponse({ status: 200, description: 'Admin found', type: Admin })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin profile' })
  @ApiResponse({
    status: 200,
    description: 'Admin updated successfully',
    type: Admin,
  })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(id, updateAdminDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete admin user' })
  @ApiResponse({ status: 200, description: 'Admin deleted successfully' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }

  // Caregiver approval endpoints
  @Post(':adminId/approve-caregiver')
  @ApiOperation({ summary: 'Approve or reject a caregiver' })
  @ApiResponse({
    status: 200,
    description: 'Caregiver approval status updated',
  })
  @ApiResponse({ status: 403, description: 'Admin lacks permission' })
  approveCaregiver(
    @Param('adminId') adminId: string,
    @Body() approveCaregiverDto: ApproveCaregiverDto,
  ) {
    return this.adminService.approveCaregiver(adminId, approveCaregiverDto);
  }

  @Get(':adminId/pending-caregivers')
  @ApiOperation({ summary: 'Get all pending caregiver approvals' })
  @ApiResponse({ status: 200, description: 'List of pending caregivers' })
  @ApiResponse({ status: 403, description: 'Admin lacks permission' })
  getPendingCaregivers(@Param('adminId') adminId: string) {
    return this.adminService.getPendingCaregivers(adminId);
  }

  @Get(':adminId/approved-caregivers')
  @ApiOperation({ summary: 'Get all approved caregivers' })
  @ApiResponse({ status: 200, description: 'List of approved caregivers' })
  @ApiResponse({ status: 403, description: 'Admin lacks permission' })
  getApprovedCaregivers(@Param('adminId') adminId: string) {
    return this.adminService.getApprovedCaregivers(adminId);
  }

  // Permission management endpoints
  @Get(':adminId/permissions')
  @ApiOperation({ summary: 'Get admin permissions' })
  @ApiResponse({ status: 200, description: 'Admin permissions retrieved' })
  async getPermissions(@Param('adminId') adminId: string) {
    const admin = await this.adminService.findOne(adminId);
    return { permissions: admin.permissions };
  }

  @Post(':adminId/permissions')
  @ApiOperation({ summary: 'Add permission to admin' })
  @ApiResponse({ status: 200, description: 'Permission added successfully' })
  addPermission(
    @Param('adminId') adminId: string,
    @Body() body: { permission: string },
  ) {
    return this.adminService.addPermission(adminId, body.permission);
  }

  @Delete(':adminId/permissions/:permission')
  @ApiOperation({ summary: 'Remove permission from admin' })
  @ApiResponse({ status: 200, description: 'Permission removed successfully' })
  removePermission(
    @Param('adminId') adminId: string,
    @Param('permission') permission: string,
  ) {
    return this.adminService.removePermission(adminId, permission);
  }

  @Get(':adminId/has-permission')
  @ApiOperation({ summary: 'Check if admin has specific permission' })
  @ApiResponse({ status: 200, description: 'Permission check result' })
  hasPermission(
    @Param('adminId') adminId: string,
    @Query('permission') permission: string,
  ) {
    const hasPermission = this.adminService.hasPermission(adminId, permission);
    return { hasPermission };
  }
}
