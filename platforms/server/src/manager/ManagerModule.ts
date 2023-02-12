import { Module } from '@nestjs/common';
import { RepositoryModule } from '../repository/RepositoryModule';

const managers = [];

@Module({
  imports: [RepositoryModule],
  providers: [...managers],
  exports: [...managers],
})
export class ManagerModule {}
