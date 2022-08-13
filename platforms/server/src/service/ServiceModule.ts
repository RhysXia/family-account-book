import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PasswordUtil } from '../common/PasswordUtil';
import { ManagerModule } from '../manager/ManagerModule';
import { RepositoryModule } from '../repository/RepositoryModule';
import { AccountBookService } from './AccountBookService';
import { FlowRecordService } from './FlowRecordService';
import { SavingAccountMoneyService } from './SavingAccountMoneyService';
import { SavingAccountService } from './SavingAccountService';
import { TagService } from './TagService';
import { UserService } from './UserService';

const services = [
  UserService,
  TagService,
  AccountBookService,
  SavingAccountService,
  SavingAccountMoneyService,
  FlowRecordService,
];

@Module({
  imports: [ScheduleModule.forRoot(), RepositoryModule, ManagerModule],
  providers: [...services, PasswordUtil],
  exports: [...services],
})
export class ServiceModule {}
