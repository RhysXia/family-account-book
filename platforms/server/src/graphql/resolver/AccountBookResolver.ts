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
import { CategoryService } from '../../service/CategoryService';
import { FlowRecordService } from '../../service/FlowRecordService';
import { SavingAccountService } from '../../service/SavingAccountService';
import { TagService } from '../../service/TagService';
import { CategoryDataLoader } from '../dataloader/CategoryDataLoader';
import { FlowRecordDataLoader } from '../dataloader/FlowRecordDataLoader';
import { SavingAccountDataLoader } from '../dataloader/SavingAccountDataLoader';
import { TagDataLoader } from '../dataloader/TagDataLoader';
import { UserDataLoader } from '../dataloader/UserDataLoader';
import CurrentUser from '../decorator/CurrentUser';
import {
  CreateAccountBookInput,
  AccountBookCategoryFilter,
  Pagination,
  UpdateAccountBookInput,
  AccountBookFlowRecordFilter,
  AccountBookTagFilter,
} from '../graphql';
import { GraphqlEntity } from '../types';
import { decodeId, encodeId, EntityName } from '../utils';
import { getUserId } from '../utils/getUserId';

@Resolver('AccountBook')
export class AccountBookResolver {
  constructor(
    private readonly accountBookService: AccountBookService,
    private readonly userDataLoader: UserDataLoader,
    private readonly savingAccountService: SavingAccountService,
    private readonly tagService: TagService,
    private readonly savingAccountDataLoader: SavingAccountDataLoader,
    private readonly tagDataLoader: TagDataLoader,
    private readonly categoryDataLoader: CategoryDataLoader,
    private readonly flowRecordDataLoader: FlowRecordDataLoader,
    private readonly flowRecordService: FlowRecordService,
    private readonly categoryService: CategoryService,
  ) {}

  @ResolveField()
  async statistics(@Parent() parent: GraphqlEntity<AccountBookEntity>) {
    const accountBookId = decodeId(EntityName.ACCOUNT_BOOK, parent.id);

    return {
      id: encodeId(EntityName.ACCOUNT_BOOK_STATISTICS, accountBookId),
    };
  }

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
  async createdBy(@Parent() parent: GraphqlEntity<AccountBookEntity>) {
    const createdBy =
      parent.createdBy || (await this.userDataLoader.load(parent.createdById));

    return createdBy
      ? { ...createdBy, id: encodeId(EntityName.USER, parent.createdById) }
      : null;
  }

  @ResolveField()
  async updatedBy(@Parent() parent: GraphqlEntity<AccountBookEntity>) {
    const updatedBy =
      parent.updatedBy || (await this.userDataLoader.load(parent.updatedById));

    return updatedBy
      ? { ...updatedBy, id: encodeId(EntityName.USER, parent.updatedById) }
      : null;
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
    const savingAccount = await this.savingAccountDataLoader.load(
      decodeId(EntityName.SAVING_ACCOUNT, id),
    );

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
  async categories(
    @Parent() parent: GraphqlEntity<AccountBookEntity>,
    @Args('filter') filter?: AccountBookCategoryFilter,
    @Args('pagination') pagination?: Pagination,
  ) {
    const parentId = decodeId(EntityName.ACCOUNT_BOOK, parent.id);

    const { type } = filter || {};

    const { total, data } =
      await this.categoryService.findAllByAccountBookIdAndPagination(
        parentId,
        {
          ...(type && { type }),
        },
        pagination,
      );

    return {
      total,
      data: data.map((it) => ({
        ...it,
        id: encodeId(EntityName.CATEGORY, it.id),
      })),
    };
  }

  @ResolveField()
  async category(
    @Parent() parent: GraphqlEntity<AccountBookEntity>,
    @Args('id') id: string,
  ) {
    const category = await this.categoryDataLoader.load(
      decodeId(EntityName.CATEGORY, id),
    );

    if (!category) {
      throw new ResourceNotFoundException('分类不存在');
    }

    const encodedAccountBookId = encodeId(
      EntityName.ACCOUNT_BOOK,
      category.accountBookId,
    );

    if (encodedAccountBookId !== parent.id) {
      // 不暴露其他数据信息，一律提示资源不存在
      throw new ResourceNotFoundException('标签不存在');
    }
    return { ...category, id };
  }

  @ResolveField()
  async tags(
    @Parent() parent: GraphqlEntity<AccountBookEntity>,
    @Args('filter') filter?: AccountBookTagFilter,
    @Args('pagination') pagination?: Pagination,
  ) {
    const parentId = decodeId(EntityName.ACCOUNT_BOOK, parent.id);

    const { categoryId } = filter || {};

    const { total, data } =
      await this.tagService.findAllByAccountBookIdAndPagination(
        parentId,
        {
          ...(categoryId && {
            categoryId: decodeId(EntityName.CATEGORY, categoryId),
          }),
        },
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
    const tag = await this.tagDataLoader.load(decodeId(EntityName.TAG, id));

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
    @Args('filter') filter?: AccountBookFlowRecordFilter,
    @Args('pagination') pagination?: Pagination,
  ) {
    const parentId = decodeId(EntityName.ACCOUNT_BOOK, parent.id);

    const {
      traderId,
      tagId,
      categoryId,
      savingAccountId,
      startDealAt,
      endDealAt,
    } = filter || {};

    const { total, data } =
      await this.flowRecordService.findAllByConditionAndPagination(
        {
          ...(traderId && {
            traderId: getUserId(traderId),
          }),
          ...(tagId && { tagId: decodeId(EntityName.TAG, tagId) }),
          ...(categoryId && {
            categoryId: decodeId(EntityName.CATEGORY, categoryId),
          }),
          ...(savingAccountId && {
            savingAccountId: decodeId(
              EntityName.SAVING_ACCOUNT,
              savingAccountId,
            ),
          }),
          ...(startDealAt && { startDealAt }),
          ...(endDealAt && { endDealAt }),
          accountBookId: parentId,
        },
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
    const flowRecord = await this.flowRecordDataLoader.load(
      decodeId(EntityName.FLOW_RECORD, id),
    );

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
    const { adminIds, memberIds, desc, name } = accountBookInput;

    const entity = await this.accountBookService.create(
      {
        name,
        ...(desc && {
          desc,
        }),
        ...(adminIds && {
          adminIds: adminIds.map((it) => getUserId(it)),
        }),
        ...(memberIds && {
          memberIds: memberIds.map((it) => getUserId(it)),
        }),
      },
      user,
    );

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
    const { id, adminIds, memberIds, desc, name } = accountBookInput;

    const entity = await this.accountBookService.update(
      decodeId(EntityName.ACCOUNT_BOOK, id),
      {
        ...(name && {
          name,
        }),
        ...(desc && {
          desc,
        }),
        ...(adminIds && {
          adminIds: adminIds.map((it) => getUserId(it)),
        }),
        ...(memberIds && {
          memberIds: memberIds.map((it) => getUserId(it)),
        }),
      },
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
}
