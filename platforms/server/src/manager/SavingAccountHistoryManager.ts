import { Injectable } from '@nestjs/common';
import { EntityManager, LessThan, MoreThanOrEqual } from 'typeorm';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { SavingAccountHistoryEntity } from '../entity/SavingAccountHistoryEntity';
import {
  ParameterException,
  ResourceNotFoundException,
} from '../exception/ServiceException';

export type UpdateSavingAccountMoneyRecord = {
  oldAmount: number;
  oldDealAt: Date;
  oldSavingAccountId: number;
  newAmount?: number;
  newDealAt?: Date;
  newSavingAccountId?: number;
};

export type SavingAccountMoneyRecord = {
  amount: number;
  dealAt: Date;
  savingAccountId: number;
};

@Injectable()
export class SavingAccountHistoryManager {
  async create(
    manager: EntityManager,
    { amount, dealAt, savingAccountId }: SavingAccountMoneyRecord,
  ) {
    let savingAccount: SavingAccountEntity;
    try {
      savingAccount = await manager.findOneOrFail(SavingAccountEntity, {
        where: {
          id: savingAccountId,
        },
      });
    } catch (err) {
      throw new ResourceNotFoundException('账户不存在');
    }

    // 判断加上amount后，余额是否小于0
    const minAmountEntity = await manager.findOne(SavingAccountHistoryEntity, {
      where: {
        savingAccountId,
        dealAt: MoreThanOrEqual(dealAt),
        amount: LessThan(-amount),
      },
    });

    if (minAmountEntity) {
      throw new ParameterException('修改余额会导致账户历史余额小于0');
    }

    // 可以保证交易时间及以后的金额都是不相同的，所以先把他们都加上amount
    await manager
      .createQueryBuilder()
      .update(SavingAccountHistoryEntity)
      .set({
        amount: () => 'amount + ' + amount,
      })
      .where('savingAccountId = :savingAccountId', {
        savingAccountId,
      })
      .andWhere('dealAt >= :dealAt', {
        dealAt,
      })
      .execute();

    // 最靠近dealAt的后一个记录和前一个记录金额有可能相同，需要处理
    const oldRecord = await manager.findOne(SavingAccountHistoryEntity, {
      where: {
        savingAccountId,
        dealAt: LessThan(dealAt),
      },
      order: {
        dealAt: 'DESC',
      },
    });

    const oldAmount = oldRecord
      ? oldRecord.amount
      : savingAccount.initialAmount;

    const record = await manager.findOne(SavingAccountHistoryEntity, {
      where: {
        savingAccountId,
        dealAt,
      },
    });

    // 交易时间已经有记录
    if (record) {
      // 该交易时间的记录加上amount后与前一个时间相同，则只需要保留前一个记录
      if (record.amount === oldAmount) {
        await manager.remove(record);
      }
      return;
    }

    if (oldAmount + amount < 0) {
      throw new ParameterException('修改余额会导致账户历史余额小于0');
    }

    // 交易时间没有记录，说明原来金额和前一个记录相同，这里增加一条记录，在前一个记录上加上amount
    const newRecord = new SavingAccountHistoryEntity();
    newRecord.dealAt = dealAt;
    newRecord.savingAccountId = savingAccountId;
    newRecord.accountBookId = savingAccount.accountBookId;
    newRecord.amount = oldAmount + amount;

    return manager.save(newRecord);
  }

  async reset(
    manager: EntityManager,
    { amount, dealAt, savingAccountId }: SavingAccountMoneyRecord,
  ) {
    return this.create(manager, { amount: -amount, dealAt, savingAccountId });
  }

  async update(
    manager: EntityManager,
    updateValue: UpdateSavingAccountMoneyRecord,
  ) {
    const {
      oldAmount,
      oldDealAt,
      oldSavingAccountId,
      newAmount = oldAmount,
      newDealAt = oldDealAt,
      newSavingAccountId = oldSavingAccountId,
    } = updateValue;

    if (
      oldAmount === newAmount &&
      oldSavingAccountId === newSavingAccountId &&
      oldDealAt.getTime() === newDealAt.getTime()
    ) {
      return;
    }

    await this.reset(manager, {
      amount: oldAmount,
      dealAt: oldDealAt,
      savingAccountId: oldSavingAccountId,
    });

    return this.create(manager, {
      amount: newAmount,
      dealAt: newDealAt,
      savingAccountId: newSavingAccountId,
    });
  }
}
