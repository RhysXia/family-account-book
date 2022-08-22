import { Args, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserEntity } from '../../entity/UserEntity';
import { AccountBookService } from '../../service/AccountBookService';
import { FlowRecordService } from '../../service/FlowRecordService';
import { SavingAccountHistoryService } from '../../service/SavingAccountHistoryService';
import { SavingAccountService } from '../../service/SavingAccountService';
import { TagService } from '../../service/TagService';
import CurrentUser from '../decorator/CurrentUser';
import { encodeId, EntityName, getIdInfo } from '../utils';

@Resolver('Node')
export class NodeResolver {
  constructor(
    private readonly accountBookService: AccountBookService,
    private readonly savingAccountService: SavingAccountService,
    private readonly flowRecordService: FlowRecordService,
    private readonly tagService: TagService,
    private readonly savingAccountHistoryService: SavingAccountHistoryService,
  ) {}

  @ResolveField()
  __resolveType(value) {
    return getIdInfo(value.id).name;
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

    return null;
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
      let p: Promise<Array<Entity>>;
      switch (key) {
        case EntityName.ACCOUNT_BOOK: {
          p = this.accountBookService.findByIdsAndUserId(
            Array.from(value),
            user.id,
          );
          break;
        }
        case EntityName.SAVING_ACCOUNT: {
          p = this.savingAccountService.findByIdsAndUserId(
            Array.from(value),
            user.id,
          );
          break;
        }
        case EntityName.FLOW_RECORD: {
          p = this.flowRecordService.findByIdsAndUserId(
            Array.from(value),
            user.id,
          );
          break;
        }
        case EntityName.TAG: {
          p = this.tagService.findByIdsAndUserId(Array.from(value), user.id);
          break;
        }
        case EntityName.SAVING_ACCOUNT_HISTORY: {
          p = this.savingAccountHistoryService.findByIdsAndUserId(
            Array.from(value),
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

    return ids.map((id) => entities.find((it) => it.id === id));
  }
}
