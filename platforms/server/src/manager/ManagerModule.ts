import { Module } from '@nestjs/common';
import { RepositoryModule } from '../repository/RepositoryModule';
import { SavingAccountHistoryManager } from './SavingAccountHistoryManager';

const managers = [SavingAccountHistoryManager];

@Module({
  imports: [RepositoryModule],
  providers: [...managers],
  exports: [...managers],
})
export class ManagerModule {}
