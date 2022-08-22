import { Injectable } from '@nestjs/common';
import {
  DataSource,
  FindOneOptions,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { SavingAccountHistoryEntity } from '../entity/SavingAccountHistoryEntity';

@Injectable()
export class SavingAccountHistoryService {
  constructor(private readonly dataSource: DataSource) {}

  async findBySavingAccountIdAndDealAtBetween(
    savingAccountId: number,
    startDate: Date,
    endDate: Date,
  ) {
    const where: FindOneOptions<SavingAccountHistoryEntity>['where'] = {
      savingAccountId,
    };

    if (startDate) {
      where.dealAt = MoreThanOrEqual(startDate);
    }
    if (endDate) {
      where.dealAt = LessThanOrEqual(endDate);
    }

    return this.dataSource.manager.find(SavingAccountHistoryEntity, {
      where,
      order: {
        dealAt: 'ASC',
      },
    });
  }

  async findByIdsAndUserId(ids: Array<number>, userId: number) {
    const savingAccountHistories = await this.dataSource.manager
      .createQueryBuilder(SavingAccountHistoryEntity, 'savingAccountHistory')
      .leftJoin('savingAccountHistory.accountBook', 'accountBook')
      .leftJoin('accountBook.admins', 'admin')
      .leftJoin('accountBook.members', 'member')
      .where('savingAccountHistory.id IN (:...ids)', { ids })
      .andWhere('admin.id = :adminId OR member.id = :memberId', {
        adminId: userId,
        memberId: userId,
      })
      .getMany();

    return savingAccountHistories;
  }
}
