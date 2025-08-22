import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    description: 'The title of the task',
    example: 'Learn NestJS',
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the task',
    example: 'Complete the NestJS tutorial with TypeORM and PostgreSQL',
  })
  @IsOptional()
  @IsString()
  description?: string;
}