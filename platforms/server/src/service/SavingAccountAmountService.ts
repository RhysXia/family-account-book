import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { SavingAccountAmountView } from '../entity/SavingAccountAmountView';

@Injectable()
export class SavingAccountAmountService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * 获取最新余额
   * @param savingAccountIds
   * @returns
   */
  async findBySavingAccountIds(savingAccountIds: Array<number>) {
    return await this.dataSource.manager.find(SavingAccountAmountView, {
      where: {
        savingAccountId: In(savingAccountIds),
      },
    });
  }
}
