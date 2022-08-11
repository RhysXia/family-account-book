import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { FlowRecordEntity } from '../../entity/FlowRecordEntity';
import { FlowRecordService } from '../../service/FlowRecordService';

@Injectable({ scope: Scope.REQUEST })
export class FlowRecordDataLoader extends DataLoader<number, FlowRecordEntity> {
  constructor(flowRecordService: FlowRecordService) {
    super(async (ids) => {
      const list = await flowRecordService.findAllByIds([...ids]);

      return ids.map((id) => list.find((it) => it.id === id));
    });
  }
}
