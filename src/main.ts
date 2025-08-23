import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);
    
    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // Global serializer interceptor to handle @Exclude decorators
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    // Swagger configuration
    const config = new DocumentBuilder()
      .setTitle('Users-Tasks API')
      .setDescription('A comprehensive NestJS REST API for managing users and their tasks with JWT authentication and RBAC')
      .setVersion('1.0')
      .addTag('auth', 'Authentication endpoints (login, signup)')
      .addTag('users', 'User management operations (Admin only + user profile)')
      .addTag('tasks', 'Task management operations (User-scoped with pagination)')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
      )
      .addServer('http://localhost:3000', 'Development server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    });

    await app.listen(3000);
    logger.log('🚀 Application is running on: http://localhost:3000');
    logger.log('📖 Swagger documentation: http://localhost:3000/api');
  } catch (error) {
    logger.error('Failed to start application:', error);
    throw error;
  }
}
bootstrap();