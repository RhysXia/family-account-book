import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PasswordUtil } from '../common/PasswordUtil';
import { ManagerModule } from '../manager/ManagerModule';
import { RepositoryModule } from '../repository/RepositoryModule';
import { AccountBookService } from './AccountBookService';
import { FlowRecordService } from './FlowRecordService';
import { SavingAccountService } from './SavingAccountService';
import { SavingAccountTransferRecordService } from './SavingAccountTransferRecordService';
import { TagService } from './TagService';
import { UserService } from './UserService';

const services = [
  UserService,
  TagService,
  AccountBookService,
  SavingAccountService,
  FlowRecordService,
  SavingAccountTransferRecordService,
];

@Module({
  imports: [ScheduleModule.forRoot(), RepositoryModule, ManagerModule],
  providers: [...services, PasswordUtil],
  exports: [...services],
})
export class ServiceModule {}
