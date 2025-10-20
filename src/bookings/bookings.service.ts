/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking, BookingStatus } from './entities/booking.entity';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class BookingsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Helper method to map database booking to entity
  private mapDatabaseBookingToEntity(dbBooking: any): Booking {
    return {
      id: dbBooking.id,
      clientId: dbBooking.clientId,
      caregiverId: dbBooking.caregiverId,
      services: dbBooking.service ? [dbBooking.service.name] : [], // Map service relation to services array
      date: dbBooking.scheduledDate
        ? new Date(dbBooking.scheduledDate).toISOString().split('T')[0]
        : '', // Format as YYYY-MM-DD
      startTime: dbBooking.startTime || '',
      endTime: dbBooking.endTime || '',
      duration: dbBooking.duration || 0,
      hourlyRate: Number(dbBooking.hourlyRate) || 0,
      totalAmount: Number(dbBooking.totalAmount),
      location: dbBooking.location || '',
      notes: dbBooking.notes,
      emergencyContactName: dbBooking.emergencyContactName,
      emergencyContactPhone: dbBooking.emergencyContactPhone,
      status: dbBooking.status as BookingStatus,
      createdAt: dbBooking.createdAt,
      updatedAt: dbBooking.updatedAt,
      confirmedAt: dbBooking.confirmedAt,
      completedAt: dbBooking.completedAt,
    };
  }

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const dbBooking = await this.databaseService.booking.create({
      data: {
        clientId: createBookingDto.clientId,
        caregiverId: createBookingDto.caregiverId,
        serviceId: createBookingDto.serviceId,
        scheduledDate: new Date(createBookingDto.scheduledDate),
        startTime: createBookingDto.startTime,
        endTime: createBookingDto.endTime,
        duration: createBookingDto.duration,
        hourlyRate: createBookingDto.hourlyRate,
        totalAmount: createBookingDto.totalAmount,
        location: createBookingDto.location,
        notes: createBookingDto.notes,
        emergencyContactName: createBookingDto.emergencyContactName,
        emergencyContactPhone: createBookingDto.emergencyContactPhone,
        status: 'PENDING',
      },
      include: { service: true },
    });

    return this.mapDatabaseBookingToEntity(dbBooking);
  }

  async findAll(): Promise<Booking[]> {
    const dbBookings = await this.databaseService.booking.findMany({
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    });
    return dbBookings.map((booking) =>
      this.mapDatabaseBookingToEntity(booking),
    );
  }

  async findOne(id: string): Promise<Booking> {
    const dbBooking = await this.databaseService.booking.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!dbBooking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return this.mapDatabaseBookingToEntity(dbBooking);
  }

  async findByClient(clientId: string): Promise<Booking[]> {
    const dbBookings = await this.databaseService.booking.findMany({
      where: { clientId },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    });
    return dbBookings.map((booking) =>
      this.mapDatabaseBookingToEntity(booking),
    );
  }

  async findByCaregiver(caregiverId: string): Promise<Booking[]> {
    const dbBookings = await this.databaseService.booking.findMany({
      where: { caregiverId },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    });
    return dbBookings.map((booking) =>
      this.mapDatabaseBookingToEntity(booking),
    );
  }

  async findByStatus(status: BookingStatus): Promise<Booking[]> {
    const dbBookings = await this.databaseService.booking.findMany({
      where: { status: status as any },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    });
    return dbBookings.map((booking) =>
      this.mapDatabaseBookingToEntity(booking),
    );
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const existingBooking = await this.databaseService.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update fields that are provided
    if (updateBookingDto.scheduledDate !== undefined) {
      updateData.scheduledDate = new Date(updateBookingDto.scheduledDate);
    }
    if (updateBookingDto.startTime !== undefined) {
      updateData.startTime = updateBookingDto.startTime;
    }
    if (updateBookingDto.endTime !== undefined) {
      updateData.endTime = updateBookingDto.endTime;
    }
    if (updateBookingDto.duration !== undefined) {
      updateData.duration = updateBookingDto.duration;
    }
    if (updateBookingDto.hourlyRate !== undefined) {
      updateData.hourlyRate = updateBookingDto.hourlyRate;
    }
    if (updateBookingDto.totalAmount !== undefined) {
      updateData.totalAmount = updateBookingDto.totalAmount;
    }
    if (updateBookingDto.location !== undefined) {
      updateData.location = updateBookingDto.location;
    }
    if (updateBookingDto.notes !== undefined) {
      updateData.notes = updateBookingDto.notes;
    }
    if (updateBookingDto.status !== undefined) {
      updateData.status = updateBookingDto.status;
    }

    const updatedBooking = await this.databaseService.booking.update({
      where: { id },
      data: updateData,
      include: { service: true },
    });

    return this.mapDatabaseBookingToEntity(updatedBooking);
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const existingBooking = await this.databaseService.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    const updatedBooking = await this.databaseService.booking.update({
      where: { id },
      data: {
        status: status as any,
        updatedAt: new Date(),
      },
      include: { service: true },
    });

    return this.mapDatabaseBookingToEntity(updatedBooking);
  }

  async remove(id: string): Promise<void> {
    const existingBooking = await this.databaseService.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    await this.databaseService.booking.delete({
      where: { id },
    });
  }

  async getBookingStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
  }> {
    const [total, pending, confirmed, completed, cancelled, revenueResult] =
      await Promise.all([
        this.databaseService.booking.count(),
        this.databaseService.booking.count({ where: { status: 'PENDING' } }),
        this.databaseService.booking.count({ where: { status: 'CONFIRMED' } }),
        this.databaseService.booking.count({ where: { status: 'COMPLETED' } }),
        this.databaseService.booking.count({ where: { status: 'CANCELLED' } }),
        this.databaseService.booking.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { totalAmount: true },
        }),
      ]);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      totalRevenue: Number(revenueResult._sum.totalAmount) || 0,
    };
  }
}
