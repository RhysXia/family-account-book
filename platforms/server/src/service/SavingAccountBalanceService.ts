import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
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
}
