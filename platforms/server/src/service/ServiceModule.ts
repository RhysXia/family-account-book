import { Module } from '@nestjs/common';
import { PasswordUtil } from '../common/PasswordUtil';
import { ManagerModule } from '../manager/ManagerModule';
import { RepositoryModule } from '../repository/RepositoryModule';
import { AccountBookService } from './AccountBookService';
import { TagService } from './TagService';
import { UserService } from './UserService';

const services = [UserService, TagService, AccountBookService];

@Module({
  imports: [RepositoryModule, ManagerModule],
  providers: [...services, PasswordUtil],
  exports: [...services],
})
export class ServiceModule {}
