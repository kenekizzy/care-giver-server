/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceDto, ServiceCategory } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';
import { DatabaseService } from '../database/database.service';
import { ServiceCategory as PrismaServiceCategory } from 'generated/prisma';

@Injectable()
export class ServicesService {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapServiceCategoryToEnum(
    category: ServiceCategory,
  ): PrismaServiceCategory {
    switch (category) {
      case ServiceCategory.PERSONAL_CARE:
        return PrismaServiceCategory.PERSONAL_CARE;
      case ServiceCategory.MEDICAL_CARE:
        return PrismaServiceCategory.MEDICAL_CARE;
      case ServiceCategory.COMPANIONSHIP:
        return PrismaServiceCategory.COMPANIONSHIP;
      case ServiceCategory.HOUSEHOLD_TASKS:
        return PrismaServiceCategory.HOUSEHOLD_TASKS;
      case ServiceCategory.TRANSPORTATION:
        return PrismaServiceCategory.TRANSPORTATION;
      case ServiceCategory.SPECIALIZED_CARE:
        return PrismaServiceCategory.SPECIALIZED_CARE;
      default:
        return PrismaServiceCategory.PERSONAL_CARE;
    }
  }

  private mapPrismaServiceToEntity(prismaService: any): Service {
    return {
      id: prismaService.id,
      name: prismaService.name,
      description: prismaService.description,
      category: prismaService.category.toLowerCase() as ServiceCategory,
      isActive: prismaService.isActive,
      createdAt: prismaService.createdAt,
      updatedAt: prismaService.updatedAt,
    };
  }

  async initializeDefaultServices(): Promise<void> {
    const existingServices = await this.databaseService.service.count();
    if (existingServices > 0) return; // Already initialized

    const defaultServices = [
      {
        name: 'Personal Care Assistance',
        description:
          'Help with daily personal care activities including bathing, dressing, and grooming',
        category: ServiceCategory.PERSONAL_CARE,
      },
      {
        name: 'Medication Management',
        description: 'Assistance with medication reminders and administration',
        category: ServiceCategory.MEDICAL_CARE,
      },
      {
        name: 'Companionship',
        description: 'Social interaction, conversation, and emotional support',
        category: ServiceCategory.COMPANIONSHIP,
      },
      {
        name: 'Light Housekeeping',
        description:
          'Basic household tasks including cleaning, laundry, and organization',
        category: ServiceCategory.HOUSEHOLD_TASKS,
      },
      {
        name: 'Transportation Services',
        description:
          'Safe transportation to appointments, shopping, and social activities',
        category: ServiceCategory.TRANSPORTATION,
      },
      {
        name: 'Dementia Care',
        description:
          "Specialized care for individuals with dementia and Alzheimer's disease",
        category: ServiceCategory.SPECIALIZED_CARE,
      },
    ];

    await this.databaseService.service.createMany({
      data: defaultServices.map((serviceData) => ({
        name: serviceData.name,
        description: serviceData.description,
        category: this.mapServiceCategoryToEnum(serviceData.category),
        isActive: true,
      })),
    });
  }

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const prismaService = await this.databaseService.service.create({
      data: {
        name: createServiceDto.name,
        description: createServiceDto.description,
        category: this.mapServiceCategoryToEnum(createServiceDto.category),
        isActive: createServiceDto.isActive ?? true,
      },
    });

    return this.mapPrismaServiceToEntity(prismaService);
  }

  async findAll(): Promise<Service[]> {
    const prismaServices = await this.databaseService.service.findMany({
      where: { isActive: true },
    });
    return prismaServices.map((service) =>
      this.mapPrismaServiceToEntity(service),
    );
  }

  async findAllIncludingInactive(): Promise<Service[]> {
    const prismaServices = await this.databaseService.service.findMany();
    return prismaServices.map((service) =>
      this.mapPrismaServiceToEntity(service),
    );
  }

  async findByCategory(category: ServiceCategory): Promise<Service[]> {
    const prismaServices = await this.databaseService.service.findMany({
      where: {
        category: this.mapServiceCategoryToEnum(category),
        isActive: true,
      },
    });
    return prismaServices.map((service) =>
      this.mapPrismaServiceToEntity(service),
    );
  }

  async findOne(id: string): Promise<Service> {
    const prismaService = await this.databaseService.service.findUnique({
      where: { id },
    });

    if (!prismaService) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return this.mapPrismaServiceToEntity(prismaService);
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    const updateData: any = {};

    if (updateServiceDto.name !== undefined)
      updateData.name = updateServiceDto.name;
    if (updateServiceDto.description !== undefined)
      updateData.description = updateServiceDto.description;
    if (updateServiceDto.category !== undefined)
      updateData.category = this.mapServiceCategoryToEnum(
        updateServiceDto.category,
      );
    if (updateServiceDto.isActive !== undefined)
      updateData.isActive = updateServiceDto.isActive;

    const prismaService = await this.databaseService.service.update({
      where: { id },
      data: updateData,
    });

    return this.mapPrismaServiceToEntity(prismaService);
  }

  async remove(id: string): Promise<void> {
    await this.databaseService.service.delete({
      where: { id },
    });
  }

  async deactivate(id: string): Promise<Service> {
    return this.update(id, { isActive: false });
  }

  async activate(id: string): Promise<Service> {
    return this.update(id, { isActive: true });
  }
}
