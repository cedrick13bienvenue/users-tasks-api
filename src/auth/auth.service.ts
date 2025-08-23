import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      this.logger.debug(`Validating user credentials for: ${email}`);
      const user = await this.usersService.findByEmail(email);
      if (user && (await user.comparePassword(password))) {
        this.logger.debug(`User credentials validated successfully: ${email}`);
        return user;
      }
      this.logger.warn(`Invalid credentials for user: ${email}`);
      return null;
    } catch (error) {
      this.logger.error(`Error validating user credentials: ${error.message}`);
      return null;
    }
  }

  async login(user: User): Promise<AuthResponseDto> {
    try {
      this.logger.debug(`Generating JWT token for user: ${user.email}`);
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(payload);
      this.logger.debug(`JWT token generated successfully for user: ${user.email}`);
      
      return {
        accessToken,
        user,
      };
    } catch (error) {
      this.logger.error(`Error generating JWT token: ${error.message}`);
      throw error;
    }
  }

  async signup(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    try {
      this.logger.debug(`Creating new user: ${createUserDto.email}`);
      const user = await this.usersService.create(createUserDto);
      this.logger.log(`User created successfully: ${user.email}`);
      return this.login(user);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation
        this.logger.warn(`Email already exists: ${createUserDto.email}`);
        throw new ConflictException('Email already exists');
      }
      this.logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }
}