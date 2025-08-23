import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
    
    this.logger.log('JWT Strategy initialized');
    this.logger.log(`JWT Secret configured: ${configService.get<string>('JWT_SECRET') ? 'Yes' : 'No (using default)'}`);
  }

  async validate(payload: JwtPayload): Promise<User> {
    try {
      this.logger.debug(`Validating JWT payload: ${JSON.stringify(payload)}`);
      const user = await this.usersService.findOne(payload.sub);
      this.logger.debug(`User found: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error(`JWT validation failed: ${error.message}`);
      throw new UnauthorizedException('User not found');
    }
  }
}