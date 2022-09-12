import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { FlowRecordEntity } from '../../entity/FlowRecordEntity';
import { FlowRecordService } from '../../service/FlowRecordService';

@Injectable({ scope: Scope.REQUEST })
export class FlowRecordDataLoader extends DataLoader<
  number,
  FlowRecordEntity | undefined
> {
  constructor(flowRecordService: FlowRecordService) {
    super(async (ids) => {
      const list = await flowRecordService.findAllByIds(ids as Array<number>);

      return ids.map((id) => list.find((it) => it.id === id));
    });
  }
}
