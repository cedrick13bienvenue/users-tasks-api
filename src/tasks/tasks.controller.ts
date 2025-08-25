import { 
  Controller, 
  Get, 
  Post, 
  Patch,
  Delete,
  Body, 
  Param, 
  Query,
  ParseIntPipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TaskOwnershipGuard } from '../auth/guards/task-ownership.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('tasks')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new task with AI-powered priority and category detection',
    description: 'AI automatically analyzes your task title and description to determine priority (URGENT /HIGH /MEDIUM /LOW) and category (WORK/ HEALTH/ FINANCE/etc.). You can optionally override the AI\'s decision by providing priority and category fields.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Task successfully created with AI analysis',
    type: Task,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiBody({ 
    type: CreateTaskDto,
    description: 'Task details - AI will auto-detect priority and category from your text',
    examples: {
      'urgent-work-task': {
        summary: 'Urgent Work Task',
        description: 'AI will detect URGENT priority and WORK category',
        value: {
          title: 'Urgent meeting with client about project deadline',
          description: 'Need to discuss the critical project that\'s due tomorrow'
        }
      },
      'shopping-task': {
        summary: 'Shopping Task',
        description: 'AI will detect MEDIUM priority and SHOPPING category',
        value: {
          title: 'Buy groceries for dinner',
          description: 'Get ingredients for tonight\'s meal'
        }
      },
      'learning-task': {
        summary: 'Learning Task',
        description: 'AI will detect MEDIUM priority and LEARNING category',
        value: {
          title: 'Learn React hooks',
          description: 'Study the new React hooks API for better state management'
        }
      }
    }
  })
  create(
    @Body(ValidationPipe) createTaskDto: CreateTaskDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.create(createTaskDto, user);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all tasks with pagination and AI analysis results (users see only their tasks, admins see all)',
    description: 'Returns tasks with AI-detected priority, category, confidence scores, and reasoning explanations'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated list of tasks with AI analysis',
    type: PaginatedResponseDto<Task>,
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  findAll(
    @CurrentUser() user: User,
    @Query(ValidationPipe) paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Task>> {
    return this.tasksService.findAll(user, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a task by ID with AI analysis results (users can only access their own tasks)',
    description: 'Returns task details including AI-detected priority, category, confidence, and reasoning'
  })
  @ApiParam({ 
    name: 'id', 
    type: 'number', 
    description: 'Task ID',
    example: 1,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Task found with AI analysis',
    type: Task,
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - not your task' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Task not found' 
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(TaskOwnershipGuard)
  @ApiOperation({ summary: 'Update task status (users can only update their own tasks)' })
  @ApiParam({ 
    name: 'id', 
    type: 'number', 
    description: 'Task ID to update',
    example: 1,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Task successfully updated',
    type: Task,
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - not your task' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Task not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid status' 
  })
  @ApiBody({ type: UpdateTaskDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto, user);
  }

  @Delete(':id')
  @UseGuards(TaskOwnershipGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task by ID (users can only delete their own tasks)' })
  @ApiParam({ 
    name: 'id', 
    type: 'number', 
    description: 'Task ID to delete',
    example: 1,
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Task successfully deleted' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - not your task' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Task not found' 
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.tasksService.remove(id, user);
  }
}