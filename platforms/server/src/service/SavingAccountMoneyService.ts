import { Injectable } from '@nestjs/common';
import {
  DataSource,
  FindOneOptions,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { SavingAccountMoneyViewEntity } from '../entity/SavingAccountMoneyViewEntity';

@Injectable()
export class SavingAccountMoneyService {
  constructor(private readonly dataSource: DataSource) {}

  async findAllNewestBySavingAccountIds(savingAccountIds: Array<number>) {
    return await this.dataSource.manager.find(SavingAccountMoneyViewEntity, {
      where: {
        savingAccountId: In(savingAccountIds),
      },
    });
  }

  async findAllBySavingAccountIdAndDealAtBetween(
    savingAccountId: number,
    startDate: Date,
    endDate: Date,
  ) {
    const where: FindOneOptions<SavingAccountMoneyViewEntity>['where'] = {
      savingAccountId,
    };

    if (startDate) {
      where.dealAt = MoreThanOrEqual(startDate);
    }
    if (endDate) {
      where.dealAt = LessThanOrEqual(endDate);
    }

    return this.dataSource.manager.find(SavingAccountMoneyViewEntity, {
      where,
      order: {
        dealAt: 'ASC',
      },
    });
  }
}
