import { Module } from '@nestjs/common';
import { PasswordUtil } from '../common/PasswordUtil';
import { ManagerModule } from '../manager/ManagerModule';
import { RepositoryModule } from '../repository/RepositoryModule';
import { TagService } from './TagService';
import { UserService } from './UserService';

const services = [UserService, TagService];

@Module({
  imports: [RepositoryModule, ManagerModule],
  providers: [...services, PasswordUtil],
  exports: [...services],
})
export class ServiceModule {}
