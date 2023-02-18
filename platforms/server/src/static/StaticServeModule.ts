import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../../browser', 'dist'),
      // PWA要求不开启http缓存策略
      serveStaticOptions: {
        cacheControl: false,
        immutable: false,
      },
    }),
  ],
})
export class StaticServeModule {}
