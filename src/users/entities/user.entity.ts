import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Task } from '../../tasks/entities/task.entity';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'The password of the user (hashed)',
    example: 'hashedPassword123',
  })
  @Column()
  password: string;

  @ApiProperty({
    description: 'List of tasks belonging to this user',
    type: () => [Task],
  })
  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];
}