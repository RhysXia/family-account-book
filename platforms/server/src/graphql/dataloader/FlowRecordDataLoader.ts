import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { FlowRecordEntity } from '../../entity/FlowRecordEntity';
import { FlowRecordService } from '../../service/FlowRecordService';
import { GraphqlEntity } from '../types';
import { decodeId, EntityName } from '../utils';

@Injectable({ scope: Scope.REQUEST })
export class FlowRecordDataLoader extends DataLoader<
  string,
  GraphqlEntity<FlowRecordEntity>
> {
  constructor(flowRecordService: FlowRecordService) {
    super(async (ids) => {
      const idValues = ids.map((it) => decodeId(EntityName.FLOW_RECORD, it));

      const list = await flowRecordService.findAllByIds(idValues);

      return idValues.map((id, index) => {
        const entity = list.find((it) => it.id === id);
        if (entity) {
          return { ...entity, id: ids[index] };
        }
      });
    });
  }
}
