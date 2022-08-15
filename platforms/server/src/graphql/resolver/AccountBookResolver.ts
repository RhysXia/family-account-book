import {
  Query,
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
  AccountBook,
  CreateAccountBookInput,
  Pagination,
  UpdateAccountBookInput,
} from '../graphql';

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
  async admins(@Parent() parent: AccountBook) {
    if (parent.admins) {
      return parent.admins;
    }
    return this.accountBookService.findAdminsByAccountBookId(parent.id);
  }

  @ResolveField()
  async members(@Parent() parent: AccountBookEntity) {
    if (parent.members) {
      return parent.members;
    }

    return this.accountBookService.findMembersByAccountBookId(parent.id);
  }

  @ResolveField()
  async creator(@Parent() parent: AccountBookEntity) {
    if (parent.creator) {
      return parent.creator;
    }
    return this.userDataLoader.load(parent.creatorId);
  }

  @ResolveField()
  async updater(@Parent() parent: AccountBookEntity) {
    if (parent.updater) {
      return parent.updater;
    }
    return this.userDataLoader.load(parent.updaterId);
  }

  @ResolveField()
  async savingAccounts(
    @Parent() parent: AccountBookEntity,
    @Args('pagination') pagination?: Pagination,
  ) {
    return this.savingAccountService.findAllByAccountBookIdAndPagination(
      parent.id,
      pagination,
    );
  }

  @ResolveField()
  async savingAccount(
    @Parent() parent: AccountBookEntity,
    @Args('id') id: number,
  ) {
    const savingAccount = await this.savingAccountDataLoader.load(id);

    if (!savingAccount || savingAccount.accountBookId !== parent.id) {
      // 不暴露其他数据信息，一律提示资源不存在
      throw new ResourceNotFoundException('储蓄账户不存在');
    }
    return savingAccount;
  }

  @ResolveField()
  async tags(
    @Parent() parent: AccountBookEntity,
    @Args('pagination') pagination?: Pagination,
  ) {
    return this.tagService.findAllByAccountBookIdAndPagination(
      parent.id,
      pagination,
    );
  }

  @ResolveField()
  async tag(@Parent() parent: AccountBookEntity, @Args('id') id: number) {
    const tag = await this.tagDataLoader.load(id);
    if (!tag || tag.accountBookId !== parent.id) {
      // 不暴露其他数据信息，一律提示资源不存在
      throw new ResourceNotFoundException('标签不存在');
    }
    return tag;
  }

  @ResolveField()
  async flowRecords(
    @Parent() parent: AccountBookEntity,
    @Args('pagination') pagination?: Pagination,
  ) {
    return this.flowRecordService.findAllByAccountBookIdAndPagination(
      parent.id,
      pagination,
    );
  }

  @ResolveField()
  async flowRecord(
    @Parent() parent: AccountBookEntity,
    @Args('id') id: number,
  ) {
    const flowRecord = await this.flowRecordDataLoader.load(id);
    if (!flowRecord || flowRecord.accountBookId !== parent.id) {
      // 不暴露其他数据信息，一律提示资源不存在
      throw new ResourceNotFoundException('流水不存在');
    }
    return flowRecord;
  }

  @Mutation()
  async createAccountBook(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('accountBook') accountBookInput: CreateAccountBookInput,
  ) {
    return this.accountBookService.create(accountBookInput, user);
  }

  @Mutation()
  async updateAccountBook(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('accountBook') accountBookInput: UpdateAccountBookInput,
  ) {
    return this.accountBookService.update(accountBookInput, user);
  }

  @Mutation()
  async deleteAccountBook(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('id') id: number,
  ) {
    await this.accountBookService.delete(id, user);
    return true;
  }

  @Query()
  async getAuthAccountBookById(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('id') id: number,
  ) {
    return this.accountBookService.findOneByIdAndUserId(id, user.id);
  }

  @Query()
  async getAuthAccountBooks(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('pagination') pagination?: Pagination,
  ) {
    return this.accountBookService.findAllByUserIdAndPagination(
      user.id,
      pagination,
    );
  }
}
