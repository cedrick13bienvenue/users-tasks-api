import { 
  Controller, 
  Get, 
  Post, 
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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully created',
    type: User,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed' 
  })
  @ApiBody({ type: CreateUserDto })
  create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all users',
    type: [User],
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID with their tasks' })
  @ApiParam({ 
    name: 'id', 
    type: 'number', 
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User found with their tasks',
    type: User,
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ 
    name: 'id', 
    type: 'number', 
    description: 'User ID to delete',
    example: 1,
  })
  @ApiResponse({ 
    status: 204, 
    description: 'User successfully deleted' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}