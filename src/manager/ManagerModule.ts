import { Module } from '@nestjs/common';
import { RepositoryModule } from '../repository/RepositoryModule';

@Module({
  imports: [RepositoryModule],
})
export class ManagerModule {}
