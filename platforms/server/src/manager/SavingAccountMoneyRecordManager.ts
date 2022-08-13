import { Injectable } from '@nestjs/common';
import { Brackets, EntityManager, LessThan } from 'typeorm';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { SavingAccountMoneyRecordEntity } from '../entity/SavingAccountMoneyRecordEntity';

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
export class SavingAccountMoneyRecordManager {
  constructor() {}

  async create(
    manager: EntityManager,
    { amount, dealAt, savingAccountId }: SavingAccountMoneyRecord,
  ) {
    // 之后的数据都加上新的余额
    await manager
      .createQueryBuilder()
      .update(SavingAccountMoneyRecordEntity)
      .set({
        amount: () => 'amount + ' + amount,
      })
      .where('savingAccountId = :savingAccountId', {
        savingAccountId,
      })
      .andWhere('dealAt > :dealAt', {
        dealAt,
      })
      .execute();

    // 交易时间已经有记录，则直接加上新的余额
    const record = await manager.findOne(SavingAccountMoneyRecordEntity, {
      where: {
        savingAccountId,
        dealAt,
      },
    });
    if (record) {
      record.amount += amount;
      return manager.save(record);
    }

    // 没有记录，则需要回去交易时间前的最新余额，在此基础上加上新的余额
    const oldRecord = await manager.findOne(SavingAccountMoneyRecordEntity, {
      where: {
        savingAccountId,
        dealAt: LessThan(dealAt),
      },
      order: {
        dealAt: 'DESC',
      },
    });

    if (oldRecord) {
      const newRecord = new SavingAccountMoneyRecordEntity();
      newRecord.amount = oldRecord.amount + amount;
      newRecord.dealAt = dealAt;
      newRecord.savingAccountId = savingAccountId;
      return manager.save(record);
    }

    // 如果没有前一条记录，说明是第一条记录，需要从账户中获取初始金额
    const savingAccount = await manager.findOne(SavingAccountEntity, {
      where: {
        id: savingAccountId,
      },
    });

    if (!savingAccount) {
      throw new Error('账户不存在');
    }

    const initialAccount = savingAccount.initialAmount;

    const newRecord = new SavingAccountMoneyRecordEntity();
    newRecord.amount = initialAccount + amount;
    newRecord.dealAt = dealAt;
    newRecord.savingAccountId = savingAccountId;

    return manager.save(newRecord);
  }

  async reset(
    manager: EntityManager,
    { amount, dealAt, savingAccountId }: SavingAccountMoneyRecord,
  ) {
    // 之后的数据都减去余额
    await manager
      .createQueryBuilder()
      .update(SavingAccountMoneyRecordEntity)
      .set({
        amount: () => 'amount - ' + amount,
      })
      .where('savingAccountId = :savingAccountId', {
        savingAccountId,
      })
      .andWhere('dealAt > :dealAt', {
        dealAt,
      })
      .execute();

    const record = await manager.findOne(SavingAccountMoneyRecordEntity, {
      where: {
        savingAccountId,
        dealAt,
      },
    });

    // 前一条记录
    const oldRecord = await manager.findOne(SavingAccountMoneyRecordEntity, {
      where: {
        savingAccountId,
        dealAt: LessThan(dealAt),
      },
      order: {
        dealAt: 'DESC',
      },
    });

    // 如果没有记录，则只需要创建一条记录并在前一条记录基础上减去相应额度即可，所有记录各不相同
    if (!record) {
      if (oldRecord) {
        const newRecord = new SavingAccountMoneyRecordEntity();
        newRecord.amount = oldRecord.amount - amount;
        newRecord.dealAt = dealAt;
        newRecord.savingAccountId = savingAccountId;
        return manager.save(newRecord);
      }

      const savingAccount = await manager.findOne(SavingAccountEntity, {
        where: {
          id: savingAccountId,
        },
      });

      if (!savingAccount) {
        throw new Error('账户不存在');
      }

      const initialAccount = savingAccount.initialAmount;
      const newRecord = new SavingAccountMoneyRecordEntity();
      newRecord.amount = initialAccount - amount;
      newRecord.dealAt = dealAt;
      newRecord.savingAccountId = savingAccountId;
      return manager.save(newRecord);
    }

    let oldAmount: number;

    if (oldRecord) {
      oldAmount = oldRecord.amount;
    } else {
      const savingAccount = await manager.findOne(SavingAccountEntity, {
        where: {
          id: savingAccountId,
        },
      });

      if (!savingAccount) {
        throw new Error('账户不存在');
      }

      oldAmount = savingAccount.initialAmount;
    }

    if (oldAmount === record.amount - amount) {
      return manager.remove(record);
    }

    record.amount -= amount;

    return manager.save(record);
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
