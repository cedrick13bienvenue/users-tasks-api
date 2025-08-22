import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/enums/user-role.enum';

@Injectable()
export class TaskOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const taskId = parseInt(request.params.id, 10);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Admins can access any task
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Check if task exists and belongs to user
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    if (task.userId !== user.id) {
      throw new ForbiddenException('You can only access your own tasks');
    }

    return true;
  }
}