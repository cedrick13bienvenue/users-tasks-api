import { 
  Controller, 
  Get, 
  Post, 
  Patch,
  Delete,
  Body, 
  Param, 
  ParseIntPipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@ApiTags('tasks')
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
    description: 'Bad request - validation failed or user not found' 
  })
  @ApiBody({ type: CreateTaskDto })
  create(@Body(ValidationPipe) createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with user information' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all tasks with user details',
    type: [Task],
  })
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID with user information' })
  @ApiParam({ 
    name: 'id', 
    type: 'number', 
    description: 'Task ID',
    example: 1,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Task found with user information',
    type: Task,
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Task not found' 
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task status' })
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
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task by ID' })
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
    status: 404, 
    description: 'Task not found' 
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}