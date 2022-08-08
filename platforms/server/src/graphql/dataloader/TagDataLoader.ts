import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { TagEntity } from '../../entity/TagEntity';
import { TagService } from '../../service/TagService';

@Injectable({ scope: Scope.REQUEST })
export class TagDataLoader extends DataLoader<number, TagEntity> {
  constructor(tagService: TagService) {
    super((ids) => tagService.findByIds([...ids]));
  }
}
