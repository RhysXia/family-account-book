import { Module } from '@nestjs/common';
import { ServiceModule } from '../service/ServiceModule';

@Module({
  imports: [ServiceModule],
})
export class ControllerModule {}
