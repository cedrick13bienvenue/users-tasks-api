import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      userId: user.id,
    });
    return await this.tasksRepository.save(task);
  }

  async findAll(user: User, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Task>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    let queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user');

    // If not admin, only show user's own tasks
    if (user.role !== UserRole.ADMIN) {
      queryBuilder = queryBuilder.where('task.userId = :userId', { userId: user.id });
    }

    const [tasks, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return new PaginatedResponseDto(tasks, total, page, limit);
  }

  async findOne(id: number, user: User): Promise<Task> {
    let queryBuilder = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user')
      .where('task.id = :id', { id });

    // If not admin, only allow access to own tasks
    if (user.role !== UserRole.ADMIN) {
      queryBuilder = queryBuilder.andWhere('task.userId = :userId', { userId: user.id });
    }

    const task = await queryBuilder.getOne();
    
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.findOne(id, user);
    Object.assign(task, updateTaskDto);
    return await this.tasksRepository.save(task);
  }

  async remove(id: number, user: User): Promise<void> {
    const task = await this.findOne(id, user);
    await this.tasksRepository.remove(task);
  }
}