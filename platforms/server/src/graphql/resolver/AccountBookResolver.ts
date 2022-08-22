import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AccountBookEntity } from '../../entity/AccountBookEntity';
import { UserEntity } from '../../entity/UserEntity';
import { ResourceNotFoundException } from '../../exception/ServiceException';
import { AccountBookService } from '../../service/AccountBookService';
import { FlowRecordService } from '../../service/FlowRecordService';
import { SavingAccountService } from '../../service/SavingAccountService';
import { TagService } from '../../service/TagService';
import { FlowRecordDataLoader } from '../dataloader/FlowRecordDataLoader';
import { SavingAccountDataLoader } from '../dataloader/SavingAccountDataLoader';
import { TagDataLoader } from '../dataloader/TagDataLoader';
import { UserDataLoader } from '../dataloader/UserDataLoader';
import CurrentUser from '../decorator/CurrentUser';
import {
  CreateAccountBookInput,
  Pagination,
  UpdateAccountBookInput,
} from '../graphql';
import { GraphqlEntity } from '../types';
import { decodeId, encodeId, EntityName } from '../utils';

@Resolver('AccountBook')
export class AccountBookResolver {
  constructor(
    private readonly accountBookService: AccountBookService,
    private readonly userDataLoader: UserDataLoader,
    private readonly savingAccountService: SavingAccountService,
    private readonly tagService: TagService,
    private readonly savingAccountDataLoader: SavingAccountDataLoader,
    private readonly tagDataLoader: TagDataLoader,
    private readonly flowRecordDataLoader: FlowRecordDataLoader,
    private readonly flowRecordService: FlowRecordService,
  ) {}

  @ResolveField()
  async admins(@Parent() parent: GraphqlEntity<AccountBookEntity>) {
    const admins =
      parent.admins ||
      (await this.accountBookService.findAdminsByAccountBookId(
        decodeId(EntityName.ACCOUNT_BOOK, parent.id),
      ));

    return admins.map((it) => ({
      ...it,
      id: encodeId(EntityName.USER, it.id),
    }));
  }

  @ResolveField()
  async members(@Parent() parent: GraphqlEntity<AccountBookEntity>) {
    const members =
      parent.members ||
      (await this.accountBookService.findMembersByAccountBookId(
        decodeId(EntityName.ACCOUNT_BOOK, parent.id),
      ));

    return members.map((it) => ({
      ...it,
      id: encodeId(EntityName.USER, it.id),
    }));
  }

  @ResolveField()
  async creator(@Parent() parent: GraphqlEntity<AccountBookEntity>) {
    const creatorId = encodeId(EntityName.USER, parent.creatorId);

    const creator =
      parent.creator || (await this.userDataLoader.load(creatorId));

    return creator ? { ...creator, id: creatorId } : null;
  }

  @ResolveField()
  async updater(@Parent() parent: GraphqlEntity<AccountBookEntity>) {
    const updaterId = encodeId(EntityName.USER, parent.updaterId);

    const updater =
      parent.updater || (await this.userDataLoader.load(updaterId));

    return updater ? { ...updater, id: updaterId } : null;
  }

  @ResolveField()
  async savingAccounts(
    @Parent() parent: GraphqlEntity<AccountBookEntity>,
    @Args('pagination') pagination?: Pagination,
  ) {
    const parentId = decodeId(EntityName.ACCOUNT_BOOK, parent.id);

    const { total, data } =
      await this.savingAccountService.findAllByAccountBookIdAndPagination(
        parentId,
        pagination,
      );

    return {
      total,
      data: data.map((it) => ({
        ...it,
        id: encodeId(EntityName.SAVING_ACCOUNT, it.id),
      })),
    };
  }

  @ResolveField()
  async savingAccount(
    @Parent() parent: GraphqlEntity<AccountBookEntity>,
    @Args('id') id: string,
  ) {
    const savingAccount = await this.savingAccountDataLoader.load(id);

    if (!savingAccount) {
      throw new ResourceNotFoundException('储蓄账户不存在');
    }

    const encodedAccountBookId = encodeId(
      EntityName.ACCOUNT_BOOK,
      savingAccount.accountBookId,
    );

    if (encodedAccountBookId !== parent.id) {
      // 不暴露其他数据信息，一律提示资源不存在
      throw new ResourceNotFoundException('储蓄账户不存在');
    }
    return { ...savingAccount, id };
  }

  @ResolveField()
  async tags(
    @Parent() parent: GraphqlEntity<AccountBookEntity>,
    @Args('pagination') pagination?: Pagination,
  ) {
    const parentId = decodeId(EntityName.ACCOUNT_BOOK, parent.id);

    const { total, data } =
      await this.tagService.findAllByAccountBookIdAndPagination(
        parentId,
        pagination,
      );

    return {
      total,
      data: data.map((it) => ({
        ...it,
        id: encodeId(EntityName.TAG, it.id),
      })),
    };
  }

  @ResolveField()
  async tag(
    @Parent() parent: GraphqlEntity<AccountBookEntity>,
    @Args('id') id: string,
  ) {
    const tag = await this.tagDataLoader.load(id);

    if (!tag) {
      throw new ResourceNotFoundException('标签不存在');
    }

    const encodedAccountBookId = encodeId(
      EntityName.ACCOUNT_BOOK,
      tag.accountBookId,
    );

    if (encodedAccountBookId !== parent.id) {
      // 不暴露其他数据信息，一律提示资源不存在
      throw new ResourceNotFoundException('标签不存在');
    }
    return { ...tag, id };
  }

  @ResolveField()
  async flowRecords(
    @Parent() parent: GraphqlEntity<AccountBookEntity>,
    @Args('pagination') pagination?: Pagination,
  ) {
    const parentId = decodeId(EntityName.ACCOUNT_BOOK, parent.id);

    const { total, data } =
      await this.flowRecordService.findAllByAccountBookIdAndPagination(
        parentId,
        pagination,
      );

    return {
      total,
      data: data.map((it) => ({
        ...it,
        id: encodeId(EntityName.FLOW_RECORD, it.id),
      })),
    };
  }

  @ResolveField()
  async flowRecord(
    @Parent() parent: GraphqlEntity<AccountBookEntity>,
    @Args('id') id: string,
  ) {
    const flowRecord = await this.flowRecordDataLoader.load(id);

    if (!flowRecord) {
      throw new ResourceNotFoundException('流水不存在');
    }

    const encodedAccountBookId = encodeId(
      EntityName.ACCOUNT_BOOK,
      flowRecord.accountBookId,
    );

    if (encodedAccountBookId !== parent.id) {
      // 不暴露其他数据信息，一律提示资源不存在
      throw new ResourceNotFoundException('流水不存在');
    }
    return { ...flowRecord, id };
  }

  @Mutation()
  async createAccountBook(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('accountBook') accountBookInput: CreateAccountBookInput,
  ) {
    const entity = await this.accountBookService.create(accountBookInput, user);
    return {
      ...entity,
      id: encodeId(EntityName.ACCOUNT_BOOK, entity.id),
    };
  }

  @Mutation()
  async updateAccountBook(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('accountBook') accountBookInput: UpdateAccountBookInput,
  ) {
    const entity = await this.accountBookService.update(
      decodeId(EntityName.ACCOUNT_BOOK, accountBookInput.id),
      accountBookInput,
      user,
    );

    return {
      ...entity,
      id: accountBookInput.id,
    };
  }

  @Mutation()
  async deleteAccountBook(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('id') id: string,
  ) {
    await this.accountBookService.delete(
      decodeId(EntityName.ACCOUNT_BOOK, id),
      user,
    );
    return true;
  }

  // @Query()
  // async getAuthAccountBookById(
  //   @CurrentUser({ required: true }) user: UserEntity,
  //   @Args('id') id: number,
  // ) {
  //   return this.accountBookService.findByIdAndCurrentUser(id, user);
  // }

  // @Query()
  // async getAuthAccountBooks(
  //   @CurrentUser({ required: true }) user: UserEntity,
  //   @Args('pagination') pagination?: Pagination,
  // ) {
  //   return this.accountBookService.findAllByUserIdAndPagination(
  //     user.id,
  //     pagination,
  //   );
  // }
}
