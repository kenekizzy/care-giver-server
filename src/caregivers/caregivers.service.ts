/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCaregiverDto } from './dto/create-caregiver.dto';
import { UpdateCaregiverDto } from './dto/update-caregiver.dto';
import { SearchCaregiversDto } from './dto/search-caregiver.dto';
import { Caregiver } from './entities/caregiver.entity';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CaregiversService {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapPrismaCaregiverToEntity(prismaProfile: any): Caregiver {
    return {
      id: prismaProfile.id,
      userId: prismaProfile.userId,
      bio: prismaProfile.bio || '',
      experience: prismaProfile.experience || 0,
      hourlyRate: Number(prismaProfile.hourlyRate) || 0,
      rating: Number(prismaProfile.rating) || 0,
      reviewCount: prismaProfile.reviewCount || 0,
      isVerified: prismaProfile.isVerified || false,
      services: prismaProfile.services?.map((s: any) => s.service.name) || [],
      certifications:
        prismaProfile.certifications?.map((c: any) => ({
          name: c.name,
          issuedBy: c.issuedBy,
          issuedDate: c.issuedDate,
          expiryDate: c.expiryDate,
          isVerified: c.isVerified,
        })) || [],
      availability: [], // Would need to map from availability table
      createdAt: prismaProfile.createdAt,
      updatedAt: prismaProfile.updatedAt,
    };
  }

  async create(createCaregiverDto: CreateCaregiverDto): Promise<Caregiver> {
    // Check if caregiver profile already exists for this user
    const existingProfile =
      await this.databaseService.caregiverProfile.findUnique({
        where: { userId: createCaregiverDto.userId },
      });

    if (existingProfile) {
      throw new ConflictException(
        'Caregiver profile already exists for this user',
      );
    }

    const prismaProfile = await this.databaseService.caregiverProfile.create({
      data: {
        userId: createCaregiverDto.userId,
        bio: createCaregiverDto.bio,
        experience: createCaregiverDto.experience,
        hourlyRate: createCaregiverDto.hourlyRate,
        rating: 5,
        reviewCount: 0,
        isVerified: false,
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        certifications: true,
      },
    });

    return this.mapPrismaCaregiverToEntity(prismaProfile);
  }

  async findAll(): Promise<Caregiver[]> {
    const prismaProfiles = await this.databaseService.caregiverProfile.findMany(
      {
        include: {
          services: {
            include: {
              service: true,
            },
          },
          certifications: true,
        },
      },
    );

    return prismaProfiles.map((profile) =>
      this.mapPrismaCaregiverToEntity(profile),
    );
  }

  async search(searchDto: SearchCaregiversDto): Promise<{
    caregivers: Caregiver[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: any = {};

    // Apply filters
    if (searchDto.services && searchDto.services.length > 0) {
      where.services = {
        some: {
          service: {
            name: {
              in: searchDto.services,
            },
          },
        },
      };
    }

    if (searchDto.minRate !== undefined) {
      where.hourlyRate = { ...where.hourlyRate, gte: searchDto.minRate };
    }

    if (searchDto.maxRate !== undefined) {
      where.hourlyRate = { ...where.hourlyRate, lte: searchDto.maxRate };
    }

    if (searchDto.minRating !== undefined) {
      where.rating = { ...where.rating, gte: searchDto.minRating };
    }

    if (searchDto.minExperience !== undefined) {
      where.experience = { ...where.experience, gte: searchDto.minExperience };
    }

    // Pagination
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const skip = (page - 1) * limit;

    const [prismaProfiles, total] = await Promise.all([
      this.databaseService.caregiverProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          services: {
            include: {
              service: true,
            },
          },
          certifications: true,
        },
      }),
      this.databaseService.caregiverProfile.count({ where }),
    ]);

    return {
      caregivers: prismaProfiles.map((profile) =>
        this.mapPrismaCaregiverToEntity(profile),
      ),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Caregiver> {
    const prismaProfile =
      await this.databaseService.caregiverProfile.findUnique({
        where: { id },
        include: {
          services: {
            include: {
              service: true,
            },
          },
          certifications: true,
        },
      });

    if (!prismaProfile) {
      throw new NotFoundException(`Caregiver with ID ${id} not found`);
    }

    return this.mapPrismaCaregiverToEntity(prismaProfile);
  }

  async findByUserId(userId: string): Promise<Caregiver | null> {
    const prismaProfile =
      await this.databaseService.caregiverProfile.findUnique({
        where: { userId },
        include: {
          services: {
            include: {
              service: true,
            },
          },
          certifications: true,
        },
      });

    return prismaProfile
      ? this.mapPrismaCaregiverToEntity(prismaProfile)
      : null;
  }

  async update(
    id: string,
    updateCaregiverDto: UpdateCaregiverDto,
  ): Promise<Caregiver> {
    const updateData: any = {};

    if (updateCaregiverDto.bio !== undefined)
      updateData.bio = updateCaregiverDto.bio;
    if (updateCaregiverDto.experience !== undefined)
      updateData.experience = updateCaregiverDto.experience;
    if (updateCaregiverDto.hourlyRate !== undefined)
      updateData.hourlyRate = updateCaregiverDto.hourlyRate;

    const prismaProfile = await this.databaseService.caregiverProfile.update({
      where: { id },
      data: updateData,
      include: {
        services: {
          include: {
            service: true,
          },
        },
        certifications: true,
      },
    });

    return this.mapPrismaCaregiverToEntity(prismaProfile);
  }

  async remove(id: string): Promise<void> {
    await this.databaseService.caregiverProfile.delete({
      where: { id },
    });
  }

  async updateAvailability(
    id: string,
    availability: {
      dayOfWeek: string;
      startTime: string;
      endTime: string;
    }[],
  ): Promise<Caregiver> {
    await this.findOne(id); // Validate caregiver exists
    // For now, just return the caregiver since availability is not fully implemented in schema
    return this.findOne(id);
  }

  async updateRating(id: string, newRating: number): Promise<Caregiver> {
    const caregiver = await this.findOne(id);
    const totalRating =
      (caregiver.rating || 0) * caregiver.reviewCount + newRating;
    const newReviewCount = caregiver.reviewCount + 1;
    const updatedRating = totalRating / newReviewCount;

    const prismaProfile = await this.databaseService.caregiverProfile.update({
      where: { id },
      data: {
        rating: Math.round(updatedRating * 100) / 100, // Round to 2 decimal places
        reviewCount: newReviewCount,
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        certifications: true,
      },
    });

    return this.mapPrismaCaregiverToEntity(prismaProfile);
  }

  // Dashboard-specific methods
  async getDashboardData(id: string): Promise<{
    profile: Caregiver;
    stats: {
      totalBookings: number;
      completedBookings: number;
      upcomingBookings: number;
      totalEarnings: number;
      monthlyEarnings: number;
      averageRating: number;
      profileCompletion: number;
      responseRate: number;
    };
    recentBookings: any[];
    recentReviews: any[];
  }> {
    const caregiver = await this.findOne(id);

    // Get booking statistics
    const totalBookings = await this.databaseService.booking.count({
      where: { caregiverId: caregiver.userId },
    });

    const completedBookings = await this.databaseService.booking.count({
      where: {
        caregiverId: caregiver.userId,
        status: 'COMPLETED',
      },
    });

    const upcomingBookings = await this.databaseService.booking.count({
      where: {
        caregiverId: caregiver.userId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    // Get earnings
    const totalEarningsResult = await this.databaseService.booking.aggregate({
      where: {
        caregiverId: caregiver.userId,
        status: 'COMPLETED',
      },
      _sum: {
        totalAmount: true,
      },
    });

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyEarningsResult = await this.databaseService.booking.aggregate({
      where: {
        caregiverId: caregiver.userId,
        status: 'COMPLETED',
        createdAt: {
          gte: currentMonth,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Get recent bookings
    const recentBookings = await this.databaseService.booking.findMany({
      where: { caregiverId: caregiver.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Calculate profile completion
    const profileCompletion = this.calculateProfileCompletion(caregiver);

    return {
      profile: caregiver,
      stats: {
        totalBookings,
        completedBookings,
        upcomingBookings,
        totalEarnings: Number(totalEarningsResult._sum.totalAmount) || 0,
        monthlyEarnings: Number(monthlyEarningsResult._sum.totalAmount) || 0,
        averageRating: caregiver.rating || 0,
        profileCompletion,
        responseRate: 95, // Mock data - would need to calculate from actual response times
      },
      recentBookings: recentBookings.map((booking) => ({
        id: booking.id,
        clientName: `${booking.client.firstName} ${booking.client.lastName}`,
        date: booking.scheduledDate,
        status: booking.status,
        amount: Number(booking.totalAmount),
      })),
      recentReviews: [], // Would need to implement reviews table
    };
  }

  async getBookings(
    id: string,
    filters: { status?: string; page?: number; limit?: number },
  ): Promise<{
    bookings: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const caregiver = await this.findOne(id);
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { caregiverId: caregiver.userId };
    if (filters.status) {
      where.status = filters.status;
    }

    const [bookings, total] = await Promise.all([
      this.databaseService.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      this.databaseService.booking.count({ where }),
    ]);

    return {
      bookings: bookings.map((booking) => ({
        id: booking.id,
        client: {
          name: `${booking.client.firstName} ${booking.client.lastName}`,
          email: booking.client.email,
          phone: booking.client.phone,
        },
        scheduledDate: booking.scheduledDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        duration: booking.duration,
        status: booking.status,
        totalAmount: Number(booking.totalAmount),
        notes: booking.notes,
        createdAt: booking.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  async getEarnings(
    id: string,
    period: 'week' | 'month' | 'year' = 'month',
  ): Promise<{
    totalEarnings: number;
    periodEarnings: number;
    earningsHistory: { date: string; amount: number }[];
    averagePerBooking: number;
  }> {
    const caregiver = await this.findOne(id);

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [totalEarnings, periodEarnings, completedBookings] =
      await Promise.all([
        this.databaseService.booking.aggregate({
          where: {
            caregiverId: caregiver.userId,
            status: 'COMPLETED',
          },
          _sum: { totalAmount: true },
        }),
        this.databaseService.booking.aggregate({
          where: {
            caregiverId: caregiver.userId,
            status: 'COMPLETED',
            createdAt: { gte: startDate },
          },
          _sum: { totalAmount: true },
        }),
        this.databaseService.booking.findMany({
          where: {
            caregiverId: caregiver.userId,
            status: 'COMPLETED',
            createdAt: { gte: startDate },
          },
          select: {
            totalAmount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        }),
      ]);

    const totalAmount = Number(totalEarnings._sum.totalAmount) || 0;
    const periodAmount = Number(periodEarnings._sum.totalAmount) || 0;
    const averagePerBooking =
      completedBookings.length > 0
        ? periodAmount / completedBookings.length
        : 0;

    // Group earnings by date for history
    const earningsHistory = completedBookings.reduce(
      (acc, booking) => {
        const date = booking.createdAt.toISOString().split('T')[0];
        const existing = acc.find((item) => item.date === date);
        if (existing) {
          existing.amount += Number(booking.totalAmount);
        } else {
          acc.push({ date, amount: Number(booking.totalAmount) });
        }
        return acc;
      },
      [] as { date: string; amount: number }[],
    );

    return {
      totalEarnings: totalAmount,
      periodEarnings: periodAmount,
      earningsHistory,
      averagePerBooking,
    };
  }

  async getReviews(
    id: string,
    filters: { page?: number; limit?: number },
  ): Promise<{
    reviews: any[];
    total: number;
    page: number;
    limit: number;
    averageRating: number;
  }> {
    const caregiver = await this.findOne(id);
    // Mock implementation - would need to implement reviews table
    return {
      reviews: [],
      total: 0,
      page: filters.page || 1,
      limit: filters.limit || 10,
      averageRating: caregiver.rating || 0,
    };
  }

  async getSchedule(
    id: string,
    filters: { startDate?: string; endDate?: string },
  ): Promise<{
    schedule: any[];
    availability: any[];
  }> {
    const caregiver = await this.findOne(id);

    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : new Date();
    const endDate = filters.endDate
      ? new Date(filters.endDate)
      : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const bookings = await this.databaseService.booking.findMany({
      where: {
        caregiverId: caregiver.userId,
        scheduledDate: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      schedule: bookings.map((booking) => ({
        id: booking.id,
        title: `Care for ${booking.client.firstName} ${booking.client.lastName}`,
        scheduledDate: booking.scheduledDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        client: `${booking.client.firstName} ${booking.client.lastName}`,
      })),
      availability: [], // Would need to implement availability table
    };
  }

  async setAvailability(
    id: string,
    availabilityData: {
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }[],
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id); // Validate caregiver exists

    // Mock implementation - would need to implement availability table
    return {
      success: true,
      message: 'Availability updated successfully',
    };
  }

  async getClients(id: string): Promise<{
    clients: any[];
    totalClients: number;
    activeClients: number;
  }> {
    const caregiver = await this.findOne(id);

    const bookings = await this.databaseService.booking.findMany({
      where: { caregiverId: caregiver.userId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Get unique clients
    const clientsMap = new Map();
    bookings.forEach((booking) => {
      const clientId = booking.client.id;
      if (!clientsMap.has(clientId)) {
        clientsMap.set(clientId, {
          id: clientId,
          name: `${booking.client.firstName} ${booking.client.lastName}`,
          email: booking.client.email,
          phone: booking.client.phone,
          totalBookings: 0,
          completedBookings: 0,
          lastBooking: null,
        });
      }

      const client = clientsMap.get(clientId);
      client.totalBookings++;
      if (booking.status === 'COMPLETED') {
        client.completedBookings++;
      }
      if (!client.lastBooking || booking.createdAt > client.lastBooking) {
        client.lastBooking = booking.createdAt;
      }
    });

    const clients = Array.from(clientsMap.values());
    const activeClients = clients.filter((client) => {
      const lastBooking = new Date(client.lastBooking);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return lastBooking > thirtyDaysAgo;
    }).length;

    return {
      clients,
      totalClients: clients.length,
      activeClients,
    };
  }

  async getNotifications(
    id: string,
    unread?: boolean,
  ): Promise<{
    notifications: any[];
    unreadCount: number;
  }> {
    await this.findOne(id); // Validate caregiver exists

    // Mock implementation - would need to implement notifications table
    const mockNotifications = [
      {
        id: '1',
        title: 'New Booking Request',
        message: 'You have a new booking request from John Doe',
        type: 'booking',
        isRead: false,
        createdAt: new Date(),
      },
      {
        id: '2',
        title: 'Payment Received',
        message: 'Payment of $150 has been processed',
        type: 'payment',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ];

    const filteredNotifications = unread
      ? mockNotifications.filter((n) => !n.isRead)
      : mockNotifications;

    return {
      notifications: filteredNotifications,
      unreadCount: mockNotifications.filter((n) => !n.isRead).length,
    };
  }

  async updateProfileCompletion(id: string): Promise<{
    profileCompletion: number;
    missingFields: string[];
  }> {
    const caregiver = await this.findOne(id);
    const profileCompletion = this.calculateProfileCompletion(caregiver);

    const missingFields: string[] = [];
    if (!caregiver.bio) missingFields.push('bio');
    if (!caregiver.experience) missingFields.push('experience');
    if (!caregiver.hourlyRate) missingFields.push('hourlyRate');
    if (!caregiver.services.length) missingFields.push('services');
    if (!caregiver.certifications.length) missingFields.push('certifications');

    return {
      profileCompletion,
      missingFields,
    };
  }

  private calculateProfileCompletion(caregiver: Caregiver): number {
    let completedFields = 0;
    const totalFields = 6;

    if (caregiver.bio) completedFields++;
    if (caregiver.experience > 0) completedFields++;
    if (caregiver.hourlyRate > 0) completedFields++;
    if (caregiver.services.length > 0) completedFields++;
    if (caregiver.certifications.length > 0) completedFields++;
    if (caregiver.isVerified) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  }

  // Public caregiver listing methods
  async getPublicListings(filters: {
    page?: number;
    limit?: number;
    location?: string;
    services?: string[];
    minRate?: number;
    maxRate?: number;
    minRating?: number;
    minExperience?: number;
    availability?: string;
    sortBy?: string;
    search?: string;
  }): Promise<{
    caregivers: any[];
    total: number;
    page: number;
    limit: number;
    filters: any;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    const where: any = {
      isVerified: true, // Only show verified caregivers
      user: {
        isVerified: true, // Only show users with verified emails
      },
    };

    // Apply search filter
    if (filters.search) {
      where.OR = [
        {
          user: {
            OR: [
              { firstName: { contains: filters.search, mode: 'insensitive' } },
              { lastName: { contains: filters.search, mode: 'insensitive' } },
            ],
          },
        },
        {
          bio: { contains: filters.search, mode: 'insensitive' },
        },
        {
          services: {
            some: {
              service: {
                name: { contains: filters.search, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    // Apply service filter
    if (filters.services && filters.services.length > 0) {
      where.services = {
        some: {
          service: {
            name: { in: filters.services },
          },
        },
      };
    }

    // Apply rate filters
    if (filters.minRate !== undefined) {
      where.hourlyRate = { ...where.hourlyRate, gte: filters.minRate };
    }
    if (filters.maxRate !== undefined) {
      where.hourlyRate = { ...where.hourlyRate, lte: filters.maxRate };
    }

    // Apply rating filter
    if (filters.minRating !== undefined) {
      where.rating = { gte: filters.minRating };
    }

    // Apply experience filter
    if (filters.minExperience !== undefined) {
      where.experience = { gte: filters.minExperience };
    }

    // Sorting
    let orderBy: any = { rating: 'desc' }; // Default sort by rating
    switch (filters.sortBy) {
      case 'price-low':
        orderBy = { hourlyRate: 'asc' };
        break;
      case 'price-high':
        orderBy = { hourlyRate: 'desc' };
        break;
      case 'experience':
        orderBy = { experience: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [caregivers, total] = await Promise.all([
      this.databaseService.caregiverProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: false, // Don't expose email in public listings
            },
          },
          services: {
            include: {
              service: true,
            },
          },
          certifications: {
            select: {
              name: true,
              isVerified: true,
            },
          },
        },
      }),
      this.databaseService.caregiverProfile.count({ where }),
    ]);

    // Calculate additional stats for each caregiver
    const enrichedCaregivers = await Promise.all(
      caregivers.map(async (caregiver) => {
        const completedBookings = await this.databaseService.booking.count({
          where: {
            caregiverId: caregiver.userId,
            status: 'COMPLETED',
          },
        });

        const totalBookings = await this.databaseService.booking.count({
          where: { caregiverId: caregiver.userId },
        });

        const repeatClientRate =
          totalBookings > 0
            ? Math.round((completedBookings / totalBookings) * 100)
            : 0;

        return {
          id: caregiver.id,
          name: `${caregiver.user.firstName} ${caregiver.user.lastName}`,
          bio: caregiver.bio,
          experience: caregiver.experience,
          hourlyRate: Number(caregiver.hourlyRate),
          rating: Number(caregiver.rating),
          reviewCount: caregiver.reviewCount,
          isVerified: caregiver.isVerified,
          services: caregiver.services.map((s) => s.service.name),
          certifications: caregiver.certifications.map((c) => ({
            name: c.name,
            isVerified: c.isVerified,
          })),
          completedJobs: completedBookings,
          repeatClientRate,
          responseTime: 'Usually responds within 2 hours', // Mock data
          availability: 'Available', // Would need to calculate from actual availability
          profileCompletion: this.calculateProfileCompletion(
            this.mapPrismaCaregiverToEntity(caregiver),
          ),
        };
      }),
    );

    return {
      caregivers: enrichedCaregivers,
      total,
      page,
      limit,
      filters: {
        location: filters.location,
        services: filters.services,
        minRate: filters.minRate,
        maxRate: filters.maxRate,
        minRating: filters.minRating,
        minExperience: filters.minExperience,
        availability: filters.availability,
        sortBy: filters.sortBy,
        search: filters.search,
      },
    };
  }

  async getPublicProfile(id: string): Promise<{
    caregiver: any;
    stats: any;
    availability: any;
    recentReviews: any[];
  }> {
    const caregiverProfile =
      await this.databaseService.caregiverProfile.findUnique({
        where: {
          id,
          isVerified: true, // Only show verified caregivers
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              phone: false, // Don't expose phone in public profile
              email: false, // Don't expose email in public profile
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

    // Get booking statistics
    const [totalBookings, completedBookings, totalEarnings] = await Promise.all(
      [
        this.databaseService.booking.count({
          where: { caregiverId: caregiverProfile.userId },
        }),
        this.databaseService.booking.count({
          where: {
            caregiverId: caregiverProfile.userId,
            status: 'COMPLETED',
          },
        }),
        this.databaseService.booking.aggregate({
          where: {
            caregiverId: caregiverProfile.userId,
            status: 'COMPLETED',
          },
          _sum: { totalAmount: true },
        }),
      ],
    );

    const repeatClientRate =
      totalBookings > 0
        ? Math.round((completedBookings / totalBookings) * 100)
        : 0;

    const caregiver = {
      id: caregiverProfile.id,
      name: `${caregiverProfile.user.firstName} ${caregiverProfile.user.lastName}`,
      bio: caregiverProfile.bio,
      experience: caregiverProfile.experience,
      hourlyRate: Number(caregiverProfile.hourlyRate),
      rating: Number(caregiverProfile.rating),
      reviewCount: caregiverProfile.reviewCount,
      isVerified: caregiverProfile.isVerified,
      services: caregiverProfile.services.map((s) => s.service.name),
      certifications: caregiverProfile.certifications.map((c) => ({
        name: c.name,
        issuedBy: c.issuedBy,
        issuedDate: c.issuedDate,
        expiryDate: c.expiryDate,
        isVerified: c.isVerified,
      })),
      languages: ['English'], // Mock data - would need to add to schema
      backgroundCheck: true, // Mock data - would need to add to schema
      insurance: true, // Mock data - would need to add to schema
      responseTime: 'Usually responds within 2 hours',
      joinDate: caregiverProfile.createdAt,
    };

    const stats = {
      totalBookings,
      completedBookings,
      repeatClientRate,
      totalEarnings: Number(totalEarnings._sum.totalAmount) || 0,
      averageRating: Number(caregiverProfile.rating),
      profileCompletion: this.calculateProfileCompletion(
        this.mapPrismaCaregiverToEntity(caregiverProfile),
      ),
    };

    // Mock availability - would need to implement availability table
    const availability = {
      monday: { available: true, slots: ['9:00 AM', '2:00 PM', '6:00 PM'] },
      tuesday: { available: true, slots: ['10:00 AM', '3:00 PM'] },
      wednesday: { available: true, slots: ['9:00 AM', '1:00 PM', '5:00 PM'] },
      thursday: { available: false, slots: [] },
      friday: { available: true, slots: ['11:00 AM', '4:00 PM'] },
      saturday: { available: true, slots: ['10:00 AM', '2:00 PM'] },
      sunday: { available: false, slots: [] },
    };

    return {
      caregiver,
      stats,
      availability,
      recentReviews: [], // Would need to implement reviews table
    };
  }

  async getPublicAvailability(
    id: string,
    filters: { startDate?: string; endDate?: string },
  ): Promise<{
    availability: any[];
    bookedSlots: any[];
  }> {
    const caregiver = await this.findOne(id);

    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : new Date();
    const endDate = filters.endDate
      ? new Date(filters.endDate)
      : new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks

    // Get booked slots
    const bookedBookings = await this.databaseService.booking.findMany({
      where: {
        caregiverId: caregiver.userId,
        scheduledDate: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
      },
      select: {
        scheduledDate: true,
        startTime: true,
        endTime: true,
      },
    });

    // Mock availability slots - would need to implement availability table
    const availableSlots: any[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (!isWeekend) {
        // Available on weekdays
        availableSlots.push({
          date: current.toISOString().split('T')[0],
          slots: [
            { time: '09:00', available: true },
            { time: '13:00', available: true },
            { time: '17:00', available: true },
          ],
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return {
      availability: availableSlots,
      bookedSlots: bookedBookings.map((booking) => ({
        scheduledDate: booking.scheduledDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
      })),
    };
  }

  async getPublicReviews(
    id: string,
    filters: { page?: number; limit?: number },
  ): Promise<{
    reviews: any[];
    total: number;
    page: number;
    limit: number;
    averageRating: number;
    ratingDistribution: any;
  }> {
    const caregiver = await this.findOne(id);
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    // Mock reviews - would need to implement reviews table
    const mockReviews = [
      {
        id: '1',
        clientName: 'John D.',
        rating: 5,
        comment: 'Excellent caregiver! Very professional and caring.',
        date: new Date('2024-01-15'),
        verified: true,
      },
      {
        id: '2',
        clientName: 'Mary S.',
        rating: 5,
        comment: 'Highly recommend! Great communication and reliability.',
        date: new Date('2024-01-10'),
        verified: true,
      },
      {
        id: '3',
        clientName: 'Robert K.',
        rating: 4,
        comment: 'Good service, punctual and professional.',
        date: new Date('2024-01-05'),
        verified: true,
      },
    ];

    const total = mockReviews.length;
    const startIndex = (page - 1) * limit;
    const reviews = mockReviews.slice(startIndex, startIndex + limit);

    const ratingDistribution = {
      5: 2,
      4: 1,
      3: 0,
      2: 0,
      1: 0,
    };

    return {
      reviews,
      total,
      page,
      limit,
      averageRating: caregiver.rating || 0,
      ratingDistribution,
    };
  }

  async getAvailableServices(): Promise<{
    services: { name: string; count: number }[];
  }> {
    const services = await this.databaseService.service.findMany({
      include: {
        _count: {
          select: {
            caregivers: true,
          },
        },
      },
    });

    return {
      services: services.map((service) => ({
        name: service.name,
        count: service._count.caregivers,
      })),
    };
  }

  getAvailableLocations(): Promise<{
    locations: { city: string; state: string; count: number }[];
  }> {
    // Mock implementation - would need to add location fields to user table
    const mockLocations = [
      { city: 'New York', state: 'NY', count: 45 },
      { city: 'Brooklyn', state: 'NY', count: 32 },
      { city: 'Manhattan', state: 'NY', count: 28 },
      { city: 'Queens', state: 'NY', count: 21 },
      { city: 'Bronx', state: 'NY', count: 15 },
    ];

    return Promise.resolve({ locations: mockLocations });
  }

  async getFeaturedCaregivers(limit: number): Promise<{
    caregivers: any[];
  }> {
    const caregivers = await this.databaseService.caregiverProfile.findMany({
      where: {
        isVerified: true,
        rating: { gte: 4.5 }, // High-rated caregivers
      },
      take: limit,
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
        certifications: {
          select: {
            name: true,
            isVerified: true,
          },
        },
      },
    });

    const featuredCaregivers = await Promise.all(
      caregivers.map(async (caregiver) => {
        const completedBookings = await this.databaseService.booking.count({
          where: {
            caregiverId: caregiver.userId,
            status: 'COMPLETED',
          },
        });

        return {
          id: caregiver.id,
          name: `${caregiver.user.firstName} ${caregiver.user.lastName}`,
          bio: caregiver.bio,
          experience: caregiver.experience,
          hourlyRate: Number(caregiver.hourlyRate),
          rating: Number(caregiver.rating),
          reviewCount: caregiver.reviewCount,
          services: caregiver.services.map((s) => s.service.name).slice(0, 3),
          certifications: caregiver.certifications
            .filter((c) => c.isVerified)
            .slice(0, 2),
          completedJobs: completedBookings,
          responseTime: 'Usually responds within 2 hours',
          featured: true,
        };
      }),
    );

    return { caregivers: featuredCaregivers };
  }
}
