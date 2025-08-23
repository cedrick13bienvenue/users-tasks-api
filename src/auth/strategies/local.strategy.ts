import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
    this.logger.log('Local Strategy initialized');
  }

  async validate(email: string, password: string): Promise<User> {
    try {
      this.logger.debug(`Attempting to validate user: ${email}`);
      const user = await this.authService.validateUser(email, password);
      if (!user) {
        this.logger.warn(`Invalid credentials for user: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      this.logger.debug(`User validated successfully: ${email}`);
      return user;
    } catch (error) {
      this.logger.error(`Local strategy validation failed: ${error.message}`);
      throw error;
    }
  }
}