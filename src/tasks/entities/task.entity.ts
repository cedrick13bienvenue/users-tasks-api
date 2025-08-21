import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { TaskStatus } from '../enums/task-status.enum';

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
    example: 'Learn NestJS',
  })
  @Column({ length: 200 })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the task',
    example: 'Complete the NestJS tutorial with TypeORM',
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