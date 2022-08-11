import {
  Query,
  Args,
  Parent,
  ResolveField,
  Resolver,
  Mutation,
} from '@nestjs/graphql';
import { TagEntity } from '../../entity/TagEntity';
import { UserEntity } from '../../entity/UserEntity';
import { TagService } from '../../service/TagService';
import { AccountBookDataLoader } from '../dataloader/AccountBookDataLoader';
import { UserDataLoader } from '../dataloader/UserDataLoader';
import CurrentUser from '../decorator/CurrentUser';
import { CreateTagInput, UpdateTagInput } from '../graphql';

@Resolver('Tag')
export class TagResolver {
  constructor(
    private readonly userDataLoader: UserDataLoader,
    private readonly accountBookDataLoader: AccountBookDataLoader,
    private readonly tagService: TagService,
  ) {}

  @ResolveField()
  async creator(@Parent() parent: TagEntity) {
    if (parent.creator) {
      return parent.creator;
    }
    return this.userDataLoader.load(parent.creatorId);
  }

  @ResolveField()
  async updater(@Parent() parent: TagEntity) {
    if (parent.updater) {
      return parent.updater;
    }
    return this.userDataLoader.load(parent.updaterId);
  }

  @ResolveField()
  async accountBook(@Parent() parent: TagEntity) {
    if (parent.accountBook) {
      return this.accountBook;
    }
    return this.accountBookDataLoader.load(parent.accountBookId);
  }

  @Query()
  getSelfTagsByAccountBookId(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('accountBookId') accountBookId: number,
  ) {
    return this.tagService.findAllByAccountBookIdAndUserId(
      accountBookId,
      currentUser.id,
    );
  }

  @Query()
  getSelfTagById(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('id') id: number,
  ) {
    return this.tagService.findOneByIdAndUserId(id, currentUser.id);
  }

  @Mutation()
  createTag(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('tag') tag: CreateTagInput,
  ) {
    return this.tagService.create(tag, currentUser);
  }

  @Mutation()
  updateTag(
    @CurrentUser({ required: true }) currentUser: UserEntity,
    @Args('tag') tag: UpdateTagInput,
  ) {
    return this.tagService.update(tag, currentUser);
  }
}
