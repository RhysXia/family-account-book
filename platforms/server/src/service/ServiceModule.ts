import { Module } from '@nestjs/common';
import { ManagerModule } from '../manager/ManagerModule';
import { RepositoryModule } from '../repository/RepositoryModule';
import { UserService } from './UserService';

const services = [UserService];

@Module({
  imports: [RepositoryModule, ManagerModule],
  providers: [...services],
  exports: [...services],
})
export class ServiceModule {}
