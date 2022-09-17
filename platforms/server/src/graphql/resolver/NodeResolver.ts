import { Args, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserEntity } from '../../entity/UserEntity';
import { ResourceNotFoundException } from '../../exception/ServiceException';
import { AccountBookService } from '../../service/AccountBookService';
import { CategoryService } from '../../service/CategoryService';
import { FlowRecordService } from '../../service/FlowRecordService';
import { SavingAccountHistoryService } from '../../service/SavingAccountHistoryService';
import { SavingAccountService } from '../../service/SavingAccountService';
import { SavingAccountTransferRecordService } from '../../service/SavingAccountTransferRecordService';
import { TagService } from '../../service/TagService';
import { UserService } from '../../service/UserService';
import CurrentUser from '../decorator/CurrentUser';
import { encodeId, EntityName, getIdInfo } from '../utils';

@Resolver('Node')
export class NodeResolver {
  constructor(
    private readonly accountBookService: AccountBookService,
    private readonly savingAccountService: SavingAccountService,
    private readonly flowRecordService: FlowRecordService,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private readonly savingAccountHistoryService: SavingAccountHistoryService,
    private readonly userService: UserService,
    private readonly savingAccountTransferRecordService: SavingAccountTransferRecordService,
  ) {}

  @ResolveField()
  __resolveType(value) {
    return value.__type;
  }

  @Query()
  async node(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('id') id: string,
  ) {
    const entities = await this.nodes(user, [id]);

    if (entities.length) {
      return entities[0];
    }

    throw new ResourceNotFoundException('Node不存在');
  }

  @Query()
  async nodes(
    @CurrentUser({ required: true }) user: UserEntity,
    @Args('ids') ids: Array<string>,
  ) {
    const idInfos = ids.map((it) => getIdInfo(it));

    const map = new Map<EntityName, Set<number>>();

    for (const { name, id } of idInfos) {
      const set = map.get(name) || new Set<number>();
      set.add(id);
      map.set(name, set);
    }

    type Entity = {
      id: number;
      [key: string]: any;
    };

    const promises: Array<Promise<Array<{ id: string }>>> = [];

    for (const [key, value] of map) {
      let p: Promise<Array<Entity>> | undefined;

      const idArray = Array.from(value);

      switch (key) {
        case EntityName.ACCOUNT_BOOK: {
          p = this.accountBookService.findByIdsAndUserId(idArray, user.id);
          break;
        }
        case EntityName.ACCOUNT_BOOK_STATISTICS: {
          p = this.accountBookService
            .findByIdsAndUserId(idArray, user.id)
            .then((array) => array.map((it) => ({ id: it.id })));
          break;
        }
        case EntityName.SAVING_ACCOUNT: {
          p = this.savingAccountService.findByIdsAndUserId(idArray, user.id);
          break;
        }
        case EntityName.FLOW_RECORD: {
          p = this.flowRecordService.findByIdsAndUserId(idArray, user.id);
          break;
        }
        case EntityName.CATEGORY: {
          p = this.categoryService.findByIdsAndUserId(idArray, user.id);
          break;
        }
        case EntityName.CATEGORY_STATISTICS: {
          p = this.categoryService
            .findByIdsAndUserId(idArray, user.id)
            .then((array) => array.map((it) => ({ id: it.id })));
          break;
        }
        case EntityName.TAG: {
          p = this.tagService.findByIdsAndUserId(idArray, user.id);
          break;
        }
        case EntityName.SAVING_ACCOUNT_HISTORY: {
          p = this.savingAccountHistoryService.findByIdsAndUserId(
            idArray,
            user.id,
          );
          break;
        }
        case EntityName.USER: {
          p = this.userService.findAllByIds(idArray);
          break;
        }
        case EntityName.SAVING_ACCOUNT_TRANSFER_RECORD: {
          p = this.savingAccountTransferRecordService.findByIdsAndUserId(
            idArray,
            user.id,
          );
          break;
        }
      }

      if (p) {
        promises.push(
          p.then((entities) =>
            entities.map((it) => ({
              ...it,
              __type: key,
              id: encodeId(key, it.id),
            })),
          ),
        );
      }
    }

    const entities = (await Promise.all(promises)).reduce((prev, it) => {
      prev.push(...it);
      return prev;
    }, []);

    return ids.map((id) => {
      const entity = entities.find((it) => it.id === id);

      if (!entity) {
        throw new ResourceNotFoundException('Node不存在');
      }
      return entity;
    });
  }
}
