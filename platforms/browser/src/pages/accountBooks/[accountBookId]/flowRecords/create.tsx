import UserSelect from '@/components/UserSelect';
import { activeAccountBookAtom, currentUserAtom } from '@/store';
import {
  FlowRecord,
  PaginationResult,
  SavingAccount,
  User,
  Tag as Itag,
} from '@/types';
import { TagColorMap } from '@/utils/constants';
import { gql, useQuery } from '@apollo/client';
import { Button, DatePicker, Input, InputNumber, Select } from 'antd';
import { useAtom } from 'jotai';

const GET_SELF_FLOW_RECORDS = gql`
  query getSelfFlowRecordsByAccountBookId(
    $accountBookId: ID!
    $pagination: Pagination
    $filter: FlowRecordFilter
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        flowRecords(pagination: $pagination, filter: $filter) {
          total
          data {
            id
            desc
            createdAt
            updatedAt
            dealAt
            trader {
              id
              nickname
              username
            }
            amount
            savingAccount {
              id
              name
              desc
            }
            tag {
              id
              name
              type
            }
          }
        }
      }
    }
  }
`;

const GET_SAVING_ACCOUNTS_BY_ACCOUNT_BOOK_ID = gql`
  query GetSavingAccountsByAccountBookId($accountBookId: ID!) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        savingAccounts {
          total
          data {
            id
            name
            desc
            amount
          }
        }
      }
    }
  }
`;

const GET_TAGS_BY_ACCOUNT_BOOK_ID = gql`
  query GetTagsByAccountBookId($accountBookId: ID!) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        tags {
          total
          data {
            id
            name
            type
          }
        }
      }
    }
  }
`;

const Create = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [currentUser] = useAtom(currentUserAtom);

  const { data: accountBookWithSavingAccounts } = useQuery<{
    node: {
      savingAccounts: PaginationResult<SavingAccount>;
    };
  }>(GET_SAVING_ACCOUNTS_BY_ACCOUNT_BOOK_ID, {
    variables: {
      accountBookId: activeAccountBook!.id,
    },
  });

  const { data: accountBookWithTags } = useQuery<{
    node: {
      tags: PaginationResult<Itag>;
    };
  }>(GET_TAGS_BY_ACCOUNT_BOOK_ID, {
    variables: {
      accountBookId: activeAccountBook!.id,
    },
  });

  const savingAccounts =
    accountBookWithSavingAccounts?.node.savingAccounts.data || [];

  const tags = accountBookWithTags?.node.tags.data || [];

  const { data, refetch } = useQuery<{
    node: {
      flowRecords: PaginationResult<
        FlowRecord & {
          trader: User;
          savingAccount: SavingAccount;
          tag: Itag;
        }
      >;
    };
  }>(GET_SELF_FLOW_RECORDS, {
    variables: {
      accountBookId: activeAccountBook?.id,
      pagination: {
        limit: 10,
      },
    },
  });

  return (
    <div className="mx-auto w-full bg-white p-6 rounded">
      <div className="table w-full rounded overflow-hidden border-collapse">
        <div className="table-header-group bg-slate-200 font-bold">
          <div className="table-cell p-2" style={{ width: 120 }}>
            金额
          </div>
          <div className="table-cell p-2">描述</div>
          <div className="table-cell p-2">日期</div>
          <div className="table-cell p-2" style={{ minWidth: 150 }}>
            标签
          </div>
          <div className="table-cell p-2" style={{ minWidth: 150 }}>
            账户
          </div>
          <div className="table-cell p-2" style={{ minWidth: 120 }}>
            交易员
          </div>
          <div className="table-cell p-2" style={{ minWidth: 100 }}>
            操作
          </div>
        </div>
        <div className="table-row-group">
          <div className="table-row">
            <div className="table-cell p-2">
              <InputNumber className="w-full" />
            </div>
            <div className="table-cell p-2">
              <Input className="w-full" />
            </div>
            <div className="table-cell p-2">
              <DatePicker className="w-full" />
            </div>
            <div className="table-cell p-2">
              <Select className="w-full">
                {tags.map((tag) => {
                  return (
                    <Select.Option
                      value={tag.id}
                      label={
                        <span className="flex items-center">
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-2"
                            style={{ background: TagColorMap[tag.type].color }}
                          ></span>
                          <span>{tag.name}</span>
                        </span>
                      }
                    >
                      <span
                        className="inline-block leading-4 rounded px-2 py-1 text-white"
                        style={{ background: TagColorMap[tag.type].color }}
                      >
                        {tag.name}
                      </span>
                    </Select.Option>
                  );
                })}
              </Select>
            </div>
            <div className="table-cell p-2">
              <Select className="w-full">
                {savingAccounts.map((it) => {
                  return <Select.Option value={it.id}>{it.name}</Select.Option>;
                })}
              </Select>
            </div>
            <div className="table-cell p-2">
              <UserSelect
                className="w-full"
                value={[
                  { label: currentUser!.nickname, value: currentUser!.id },
                ]}
              />
            </div>
            <div className="table-cell p-2">
              <Button type="primary">保存</Button>
            </div>
          </div>

          {data?.node.flowRecords.data.map((it) => {
            return (
              <div className="table-row">
                <div className="table-cell p-2">{it.amount}</div>
                <div className="table-cell p-2">{it.desc}</div>
                <div className="table-cell p-2">{it.createdAt}</div>
                <div className="table-cell p-2">{it.tag.name}</div>
                <div className="table-cell p-2">{it.trader.nickname}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Create;
