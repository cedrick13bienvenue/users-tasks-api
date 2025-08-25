import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskCategory } from '../enums/task-category.enum';

export class CreateTaskDto {
  @ApiProperty({
    description: 'The title of the task (AI will analyze this for priority and category)',
    example: 'Urgent meeting with client about project deadline',
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the task (AI will also analyze this for better detection)',
    example: 'Need to discuss the critical project that\'s due tomorrow',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Priority level (optional - AI will auto-detect if not provided)',
    enum: TaskPriority,
    example: TaskPriority.URGENT,
    default: 'Auto-detected by AI',
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Category (optional - AI will auto-detect if not provided)',
    enum: TaskCategory,
    example: TaskCategory.WORK,
    default: 'Auto-detected by AI',
  })
  @IsOptional()
  @IsEnum(TaskCategory)
  category?: TaskCategory;
}