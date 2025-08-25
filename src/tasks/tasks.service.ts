import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { EnhancedAiTaskAnalyzerService } from './services/ai-task-analyzer.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private enhancedAiAnalyzer: EnhancedAiTaskAnalyzerService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    this.logger.debug(`Creating task for user ${user.email}: ${createTaskDto.title}`);

    // Use Enhanced AI analyzer with NLP for better priority and category detection
    let priority = createTaskDto.priority;
    let category = createTaskDto.category;
    let aiConfidence: number | null = null;
    let aiReasoning: string[] | null = null;
    let nlpInsights: any = null;

    if (!priority || !category) {
      this.logger.debug('Running Enhanced NLP analysis for automatic priority and category detection');
      const analysis = this.enhancedAiAnalyzer.analyzeTask(
        createTaskDto.title,
        createTaskDto.description
      );
      
      priority = priority || analysis.priority;
      category = category || analysis.category;
      aiConfidence = analysis.confidence;
      aiReasoning = analysis.reasoning;
      nlpInsights = analysis.nlpInsights;
      
      this.logger.debug(`Enhanced NLP analysis result: Priority=${priority}, Category=${category}, Confidence=${aiConfidence}, Sentiment=${nlpInsights?.sentiment}`);
    }

    const task = new Task();
    Object.assign(task, {
      ...createTaskDto,
      priority,
      category,
      aiConfidence,
      aiReasoning,
      userId: user.id,
    });

    const savedTask = await this.tasksRepository.save(task);
    this.logger.log(`Task created successfully: ${savedTask.title} (ID: ${savedTask.id})`);
    
    return savedTask;
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