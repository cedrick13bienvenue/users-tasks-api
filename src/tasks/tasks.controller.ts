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
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ 
    status: 201, 
    description: 'Task successfully created',
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
  @ApiBody({ type: CreateTaskDto })
  create(
    @Body(ValidationPipe) createTaskDto: CreateTaskDto,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.create(createTaskDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with pagination (users see only their tasks, admins see all)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated list of tasks',
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
  @ApiOperation({ summary: 'Get a task by ID (users can only access their own tasks)' })
  @ApiParam({ 
    name: 'id', 
    type: 'number', 
    description: 'Task ID',
    example: 1,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Task found',
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