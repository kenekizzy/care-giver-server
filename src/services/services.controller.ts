import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CreateServiceDto, ServiceCategory } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({
    status: 201,
    description: 'Service created successfully',
    type: Service,
  })
  async create(@Body() createServiceDto: CreateServiceDto): Promise<Service> {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active services' })
  @ApiQuery({
    name: 'category',
    enum: ServiceCategory,
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'includeInactive',
    type: 'boolean',
    required: false,
    description: 'Include inactive services',
  })
  @ApiResponse({
    status: 200,
    description: 'Services retrieved successfully',
    type: [Service],
  })
  async findAll(
    @Query('category') category?: ServiceCategory,
    @Query('includeInactive') includeInactive?: boolean,
  ): Promise<Service[]> {
    if (includeInactive) {
      return this.servicesService.findAllIncludingInactive();
    }

    if (category) {
      return this.servicesService.findByCategory(category);
    }

    return this.servicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiResponse({
    status: 200,
    description: 'Service retrieved successfully',
    type: Service,
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async findOne(@Param('id') id: string): Promise<Service> {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service by ID' })
  @ApiResponse({
    status: 200,
    description: 'Service updated successfully',
    type: Service,
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service by ID' })
  @ApiResponse({ status: 204, description: 'Service deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.servicesService.remove(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate service' })
  @ApiResponse({
    status: 200,
    description: 'Service deactivated successfully',
    type: Service,
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async deactivate(@Param('id') id: string): Promise<Service> {
    return this.servicesService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate service' })
  @ApiResponse({
    status: 200,
    description: 'Service activated successfully',
    type: Service,
  })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async activate(@Param('id') id: string): Promise<Service> {
    return this.servicesService.activate(id);
  }
}
