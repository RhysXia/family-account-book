import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, In } from 'typeorm';
import { SavingAccountEntity } from '../entity/SavingAccountEntity';
import { SavingAccountTransferRecordEntity } from '../entity/SavingAccountTransferRecordEntity';
import { UserEntity } from '../entity/UserEntity';
import {
  ParameterException,
  ResourceNotFoundException,
} from '../exception/ServiceException';
import {
  CreateSavingAccountTransferRecord,
  UpdateSavingAccountTransferRecord,
} from '../graphql/graphql';
import { SavingAccountHistoryManager } from '../manager/SavingAccountHistoryManager';

@Injectable()
export class SavingAccountTransferRecordService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly savingAccountHistoryManager: SavingAccountHistoryManager,
  ) {}

  async delete(id: number, currentUser: UserEntity) {
    return this.dataSource.transaction(async (manager) => {
      const record = await manager.findOne(SavingAccountTransferRecordEntity, {
        where: {
          id,
          accountBook: [
            {
              admins: [{ id: currentUser.id }],
            },
            {
              members: [{ id: currentUser.id }],
            },
          ],
        },
      });

      if (!record) {
        throw new ResourceNotFoundException('记录不存在');
      }

      await this.savingAccountHistoryManager.reset(manager, {
        amount: -record.amount,
        dealAt: record.dealAt,
        savingAccountId: record.from.id,
      });

      await this.savingAccountHistoryManager.reset(manager, {
        amount: record.amount,
        dealAt: record.dealAt,
        savingAccountId: record.to.id,
      });

      return manager.remove(record);
    });
  }

  findAllByIds(ids: Array<number>) {
    return this.dataSource.manager.find(SavingAccountTransferRecordEntity, {
      where: {
        id: In(ids),
      },
    });
  }

  async create(
    record: CreateSavingAccountTransferRecord,
    currentUser: UserEntity,
  ) {
    const {
      name,
      desc,
      amount,
      fromSavingAccountId,
      toSavingAccountId,
      dealAt,
    } = record;

    if (amount <= 0) {
      throw new ParameterException('金额必须大于0');
    }

    if (fromSavingAccountId === toSavingAccountId) {
      throw new ParameterException('转入和转出账户不能相同');
    }

    return this.dataSource.transaction(async (manager) => {
      const fromSavingAccount = await manager
        .createQueryBuilder(SavingAccountEntity, 'savingAccount')
        .leftJoin('savingAccount.admins', 'admin')
        .leftJoin('savingAccount.members', 'member')
        .where('savingAccount.id = :id', { id: fromSavingAccountId })
        .andWhere(
          new Brackets((qb) => {
            qb.where('admin.id = :id', { id: currentUser.id });
            qb.orWhere('member.id = :id', { id: currentUser.id });
          }),
        )
        .getOne();

      if (!fromSavingAccount) {
        throw new ResourceNotFoundException('转出账户不存在');
      }

      const toSavingAccount = await manager
        .createQueryBuilder(SavingAccountEntity, 'savingAccount')
        .leftJoin('savingAccount.admins', 'admin')
        .leftJoin('savingAccount.members', 'member')
        .where('savingAccount.id = :id', { id: toSavingAccountId })
        .andWhere(
          new Brackets((qb) => {
            qb.where('admin.id = :id', { id: currentUser.id });
            qb.orWhere('member.id = :id', { id: currentUser.id });
          }),
        )
        .getOne();

      if (!toSavingAccount) {
        throw new ResourceNotFoundException('转入账户不存在');
      }

      if (fromSavingAccount.accountBookId !== toSavingAccount.accountBookId) {
        throw new ParameterException('转出账户和转入账户不在同一个账本');
      }

      await this.savingAccountHistoryManager.create(manager, {
        amount: -amount,
        dealAt,
        savingAccountId: fromSavingAccountId,
      });

      await this.savingAccountHistoryManager.create(manager, {
        amount,
        dealAt,
        savingAccountId: toSavingAccountId,
      });

      const record = new SavingAccountTransferRecordEntity();

      record.name = name;
      record.desc = desc;
      record.amount = amount;
      record.creator = currentUser;
      record.updater = currentUser;
      record.from = fromSavingAccount;
      record.to = toSavingAccount;
      record.dealAt = dealAt;

      return manager.save(record);
    });
  }

  async update(
    id: number,
    record: Omit<UpdateSavingAccountTransferRecord, 'id'>,
    currentUser: UserEntity,
  ) {
    const {
      name,
      desc,
      amount,
      fromSavingAccountId,
      toSavingAccountId,
      dealAt,
    } = record;

    if (amount <= 0) {
      throw new ParameterException('金额必须大于0');
    }

    return this.dataSource.transaction(async (manager) => {
      const record = await manager.findOne(SavingAccountTransferRecordEntity, {
        where: {
          id,
        },
        relations: {
          from: true,
          to: true,
        },
      });

      if (!record) {
        throw new ResourceNotFoundException('转账记录不存在');
      }

      await this.savingAccountHistoryManager.reset(manager, {
        amount: -record.amount,
        dealAt: record.dealAt,
        savingAccountId: record.fromId,
      });

      await this.savingAccountHistoryManager.reset(manager, {
        amount: record.amount,
        dealAt: record.dealAt,
        savingAccountId: record.toId,
      });

      record.updater = currentUser;

      if (name) {
        record.name = name;
      }

      if (desc) {
        record.desc = desc;
      }

      if (amount) {
        record.amount = amount;
      }

      if (dealAt) {
        record.dealAt = dealAt;
      }

      if (fromSavingAccountId) {
        const fromSavingAccount = await manager
          .createQueryBuilder(SavingAccountEntity, 'savingAccount')
          .leftJoin('savingAccount.admins', 'admin')
          .leftJoin('savingAccount.members', 'member')
          .where('savingAccount.id = :id', { id: fromSavingAccountId })
          .andWhere(
            new Brackets((qb) => {
              qb.where('admin.id = :id', { id: currentUser.id });
              qb.orWhere('member.id = :id', { id: currentUser.id });
            }),
          )
          .getOne();

        if (!fromSavingAccount) {
          throw new ResourceNotFoundException('转出账户不存在');
        }

        if (fromSavingAccount.accountBookId !== record.from.accountBookId) {
          throw new ParameterException('不能跨账本修改转账记录');
        }

        record.from = fromSavingAccount;
      }

      if (toSavingAccountId) {
        const toSavingAccount = await manager
          .createQueryBuilder(SavingAccountEntity, 'savingAccount')
          .leftJoin('savingAccount.admins', 'admin')
          .leftJoin('savingAccount.members', 'member')
          .where('savingAccount.id = :id', { id: toSavingAccountId })
          .andWhere(
            new Brackets((qb) => {
              qb.where('admin.id = :id', { id: currentUser.id });
              qb.orWhere('member.id = :id', { id: currentUser.id });
            }),
          )
          .getOne();

        if (!toSavingAccount) {
          throw new ResourceNotFoundException('转入账户不存在');
        }

        if (toSavingAccount.accountBookId !== record.to.accountBookId) {
          throw new ParameterException('不能跨账本修改转账记录');
        }

        record.to = toSavingAccount;
      }

      if (record.to.accountBookId !== record.from.accountBookId) {
        throw new ParameterException('转出账户和转入账户不在同一个账本');
      }

      await this.savingAccountHistoryManager.create(manager, {
        amount: -record.amount,
        dealAt: record.dealAt,
        savingAccountId: record.from.id,
      });

      await this.savingAccountHistoryManager.create(manager, {
        amount: record.amount,
        dealAt: record.dealAt,
        savingAccountId: record.to.id,
      });

      return manager.save(record);
    });
  }
}
