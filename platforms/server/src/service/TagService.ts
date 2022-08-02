import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { TagEntity } from '../entity/TagEntity';

@Injectable()
export class TagService {
  constructor(private readonly dataSource: DataSource) {}

  findByIds(ids: number[]): Promise<Array<TagEntity>> {
    return this.dataSource.manager.find(TagEntity, {
      where: {
        id: In(ids),
      },
    });
  }
}
