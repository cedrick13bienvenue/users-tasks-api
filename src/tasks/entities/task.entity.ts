import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskCategory } from '../enums/task-category.enum';

@Entity('tasks')
export class Task {
  @ApiProperty({
    description: 'The unique identifier of the task',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The title of the task',
    example: 'Urgent meeting with client about project deadline',
  })
  @Column({ length: 200 })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the task',
    example: 'Need to discuss the critical project that\'s due tomorrow',
    required: false,
  })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({
    description: 'Current status of the task',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'Priority level of the task (auto-detected by AI)',
    enum: TaskPriority,
    example: TaskPriority.URGENT,
  })
  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @ApiProperty({
    description: 'Category of the task (auto-detected by AI)',
    enum: TaskCategory,
    example: TaskCategory.WORK,
  })
  @Column({
    type: 'enum',
    enum: TaskCategory,
    default: TaskCategory.OTHER,
  })
  category: TaskCategory;

  @ApiProperty({
    description: 'AI analysis confidence score (0-1) - how certain the AI is about its analysis',
    example: 0.95,
    required: false,
  })
  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  aiConfidence: number;

  @ApiProperty({
    description: 'AI analysis reasoning - explains why the AI made its decisions',
    example: [
      'Priority set to URGENT based on keywords: urgent, deadline',
      'Category set to WORK based on keywords: meeting, project, client'
    ],
    required: false,
  })
  @Column('simple-array', { nullable: true })
  aiReasoning: string[];

  @ApiProperty({
    description: 'ID of the user who owns this task',
    example: 1,
  })
  @Column()
  userId: number;

  @ApiProperty({
    description: 'The user who owns this task',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'userId' })
  user: User;
}