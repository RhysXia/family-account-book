import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { TagEntity } from '../../entity/TagEntity';
import { TagService } from '../../service/TagService';

@Injectable({ scope: Scope.REQUEST })
export class TagDataLoader extends DataLoader<number, TagEntity | undefined> {
  constructor(tagService: TagService) {
    super(async (ids) => {
      const list = await tagService.findByIds(Array.from(new Set(ids)));

      return ids.map((id) => list.find((it) => it.id === id));
    });
  }
}
