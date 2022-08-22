import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { TagEntity } from '../../entity/TagEntity';
import { TagService } from '../../service/TagService';
import { GraphqlEntity } from '../types';
import { decodeId, EntityName } from '../utils';

@Injectable({ scope: Scope.REQUEST })
export class TagDataLoader extends DataLoader<
  string,
  GraphqlEntity<TagEntity>
> {
  constructor(tagService: TagService) {
    super(async (ids) => {
      const idValues = ids.map((it) => decodeId(EntityName.TAG, it));
      const list = await tagService.findByIds(idValues);

      return idValues.map((id, index) => {
        const entity = list.find((it) => it.id === id);
        if (entity) {
          return { ...entity, id: ids[index] };
        }
      });
    });
  }
}
