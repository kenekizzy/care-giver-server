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
import { CaregiversService } from './caregivers.service';
import { CreateCaregiverDto } from './dto/create-caregiver.dto';
import { UpdateCaregiverDto } from './dto/update-caregiver.dto';
import { SearchCaregiversDto } from './dto/search-caregiver.dto';
import { Caregiver } from './entities/caregiver.entity';

@ApiTags('caregivers')
@Controller('caregivers')
export class CaregiversController {
  constructor(private readonly caregiversService: CaregiversService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new caregiver profile' })
  @ApiResponse({
    status: 201,
    description: 'Caregiver profile created successfully',
    type: Caregiver,
  })
  create(@Body() createCaregiverDto: CreateCaregiverDto) {
    return this.caregiversService.create(createCaregiverDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all caregivers' })
  @ApiResponse({
    status: 200,
    description: 'List of all caregivers',
    type: [Caregiver],
  })
  findAll() {
    return this.caregiversService.findAll();
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public caregiver listings' })
  @ApiResponse({
    status: 200,
    description: 'Public caregiver listings with basic information',
  })
  getPublicListings(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('location') location?: string,
    @Query('services') services?: string,
    @Query('minRate') minRate?: number,
    @Query('maxRate') maxRate?: number,
    @Query('minRating') minRating?: number,
    @Query('minExperience') minExperience?: number,
    @Query('availability') availability?: string,
    @Query('sortBy') sortBy?: string,
    @Query('search') search?: string,
  ) {
    return this.caregiversService.getPublicListings({
      page,
      limit,
      location,
      services: services ? services.split(',') : undefined,
      minRate,
      maxRate,
      minRating,
      minExperience,
      availability,
      sortBy,
      search,
    });
  }

  @Get('public/:id')
  @ApiOperation({ summary: 'Get public caregiver profile' })
  @ApiResponse({
    status: 200,
    description: 'Public caregiver profile with detailed information',
  })
  getPublicProfile(@Param('id') id: string) {
    return this.caregiversService.getPublicProfile(id);
  }

  @Get('public/:id/availability')
  @ApiOperation({ summary: 'Get caregiver availability for booking' })
  @ApiResponse({
    status: 200,
    description: 'Caregiver availability slots',
  })
  getPublicAvailability(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.caregiversService.getPublicAvailability(id, {
      startDate,
      endDate,
    });
  }

  @Get('public/:id/reviews')
  @ApiOperation({ summary: 'Get caregiver public reviews' })
  @ApiResponse({
    status: 200,
    description: 'Public reviews for the caregiver',
  })
  getPublicReviews(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.caregiversService.getPublicReviews(id, { page, limit });
  }

  @Get('services')
  @ApiOperation({ summary: 'Get available services' })
  @ApiResponse({
    status: 200,
    description: 'List of available caregiver services',
  })
  getAvailableServices() {
    return this.caregiversService.getAvailableServices();
  }

  @Get('locations')
  @ApiOperation({ summary: 'Get available locations' })
  @ApiResponse({
    status: 200,
    description: 'List of available locations',
  })
  getAvailableLocations() {
    return this.caregiversService.getAvailableLocations();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured caregivers' })
  @ApiResponse({
    status: 200,
    description: 'List of featured caregivers',
  })
  getFeaturedCaregivers(@Query('limit') limit?: number) {
    return this.caregiversService.getFeaturedCaregivers(limit || 6);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search caregivers with filters' })
  @ApiResponse({ status: 200, description: 'Filtered list of caregivers' })
  search(@Query() searchDto: SearchCaregiversDto) {
    return this.caregiversService.search(searchDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get caregiver profile by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Caregiver profile found',
    type: Caregiver,
  })
  @ApiResponse({ status: 404, description: 'Caregiver profile not found' })
  findByUserId(@Param('userId') userId: string) {
    return this.caregiversService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get caregiver by ID' })
  @ApiResponse({ status: 200, description: 'Caregiver found', type: Caregiver })
  @ApiResponse({ status: 404, description: 'Caregiver not found' })
  findOne(@Param('id') id: string) {
    return this.caregiversService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update caregiver profile' })
  @ApiResponse({
    status: 200,
    description: 'Caregiver updated successfully',
    type: Caregiver,
  })
  @ApiResponse({ status: 404, description: 'Caregiver not found' })
  update(
    @Param('id') id: string,
    @Body() updateCaregiverDto: UpdateCaregiverDto,
  ) {
    return this.caregiversService.update(id, updateCaregiverDto);
  }

  @Patch(':id/availability')
  @ApiOperation({ summary: 'Update caregiver availability' })
  @ApiResponse({
    status: 200,
    description: 'Availability updated successfully',
    type: Caregiver,
  })
  updateAvailability(
    @Param('id') id: string,
    @Body()
    availability: { dayOfWeek: string; startTime: string; endTime: string }[],
  ) {
    return this.caregiversService.updateAvailability(id, availability);
  }

  @Patch(':id/rating')
  @ApiOperation({ summary: 'Update caregiver rating' })
  @ApiResponse({
    status: 200,
    description: 'Rating updated successfully',
    type: Caregiver,
  })
  updateRating(@Param('id') id: string, @Body() body: { rating: number }) {
    return this.caregiversService.updateRating(id, body.rating);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete caregiver profile' })
  @ApiResponse({ status: 200, description: 'Caregiver deleted successfully' })
  @ApiResponse({ status: 404, description: 'Caregiver not found' })
  remove(@Param('id') id: string) {
    return this.caregiversService.remove(id);
  }

  // Dashboard-specific endpoints
  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Get caregiver dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  getDashboard(@Param('id') id: string) {
    return this.caregiversService.getDashboardData(id);
  }

  @Get(':id/bookings')
  @ApiOperation({ summary: 'Get caregiver bookings' })
  @ApiResponse({
    status: 200,
    description: 'Bookings retrieved successfully',
  })
  getBookings(
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.caregiversService.getBookings(id, { status, page, limit });
  }

  @Get(':id/earnings')
  @ApiOperation({ summary: 'Get caregiver earnings data' })
  @ApiResponse({
    status: 200,
    description: 'Earnings data retrieved successfully',
  })
  getEarnings(
    @Param('id') id: string,
    @Query('period') period?: 'week' | 'month' | 'year',
  ) {
    return this.caregiversService.getEarnings(id, period);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get caregiver reviews' })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
  })
  getReviews(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.caregiversService.getReviews(id, { page, limit });
  }

  @Get(':id/schedule')
  @ApiOperation({ summary: 'Get caregiver schedule' })
  @ApiResponse({
    status: 200,
    description: 'Schedule retrieved successfully',
  })
  getSchedule(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.caregiversService.getSchedule(id, { startDate, endDate });
  }

  @Post(':id/availability')
  @ApiOperation({ summary: 'Set caregiver availability' })
  @ApiResponse({
    status: 200,
    description: 'Availability set successfully',
  })
  setAvailability(
    @Param('id') id: string,
    @Body()
    availabilityData: {
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }[],
  ) {
    return this.caregiversService.setAvailability(id, availabilityData);
  }

  @Get(':id/clients')
  @ApiOperation({ summary: 'Get caregiver clients' })
  @ApiResponse({
    status: 200,
    description: 'Clients retrieved successfully',
  })
  getClients(@Param('id') id: string) {
    return this.caregiversService.getClients(id);
  }

  @Get(':id/notifications')
  @ApiOperation({ summary: 'Get caregiver notifications' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  getNotifications(@Param('id') id: string, @Query('unread') unread?: boolean) {
    return this.caregiversService.getNotifications(id, unread);
  }

  @Patch(':id/profile-completion')
  @ApiOperation({ summary: 'Update profile completion status' })
  @ApiResponse({
    status: 200,
    description: 'Profile completion updated successfully',
  })
  updateProfileCompletion(@Param('id') id: string) {
    return this.caregiversService.updateProfileCompletion(id);
  }
}
