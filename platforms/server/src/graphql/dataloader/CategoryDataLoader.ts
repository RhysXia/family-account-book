import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { CategoryEntity } from '../../entity/CategoryEntity';
import { CategoryService } from '../../service/CategoryService';

@Injectable({ scope: Scope.REQUEST })
export class CategoryDataLoader extends DataLoader<
  number,
  CategoryEntity | undefined
> {
  constructor(categoryService: CategoryService) {
    super(async (ids) => {
      const list = await categoryService.findAllByIds(Array.from(new Set(ids)));

      return ids.map((id) => list.find((it) => it.id === id));
    });
  }
}
