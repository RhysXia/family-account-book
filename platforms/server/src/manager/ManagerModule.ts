import { Module } from '@nestjs/common';
import { RepositoryModule } from '../repository/RepositoryModule';
import { SavingAccountMoneyRecordManager } from './SavingAccountMoneyRecordManager';

const managers = [SavingAccountMoneyRecordManager];

@Module({
  imports: [RepositoryModule],
  providers: [...managers],
  exports: [...managers],
})
export class ManagerModule {}
