import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { EnhancedAiTaskAnalyzerService } from './services/ai-task-analyzer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [TasksService, EnhancedAiTaskAnalyzerService],
  exports: [TasksService],
})
export class TasksModule {}