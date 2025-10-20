import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Caregiving Platform API')
    .setDescription(
      `
      A comprehensive API for managing a caregiving platform that connects clients with professional caregivers.
      
      ## Features
      - **User Management**: Register and manage users (clients, caregivers, admins)
      - **Caregiver Profiles**: Create and manage detailed caregiver profiles with services, certifications, and availability
      - **Admin Panel**: Administrative functions for approving caregivers and managing the platform
      - **Booking System**: Schedule and manage caregiving appointments
      - **Service Management**: Define and categorize available caregiving services
      
      ## Authentication
      This API uses Bearer token authentication. Include your token in the Authorization header:
      \`Authorization: Bearer <your-token>\`
      
      ## Getting Started
      1. Register a user account
      2. Create a caregiver profile (if you're a caregiver)
      3. Browse available caregivers and services
      4. Book appointments or manage your profile
      
      ## Support
      For API support, please contact the development team.
    `,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('users', 'User management operations')
    .addTag('caregivers', 'Caregiver profile and search operations')
    .addTag('admin', 'Administrative operations for platform management')
    .addTag('bookings', 'Appointment booking and management')
    .addTag('services', 'Service category and management operations')
    .addServer('http://localhost:3001', 'Development server')
    .addServer('https://api.caregiving-platform.com', 'Production server')
    .setContact(
      'API Support',
      'https://caregiving-platform.com/support',
      'support@caregiving-platform.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (_controllerKey: string, methodKey: string) =>
      methodKey,
  });

  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Caregiving Platform API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .topbar-wrapper img { content: url('/logo.png'); width: 120px; height: auto; }
      .swagger-ui .topbar { background-color: #2c5aa0; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  });

  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
