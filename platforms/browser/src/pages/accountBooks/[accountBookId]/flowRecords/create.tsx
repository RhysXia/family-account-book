import DatePicker from '@/components/DatePicker';
import UserSelect, { ValueType } from '@/components/UserSelect';
import { activeAccountBookAtom, currentUserAtom } from '@/store';
import {
  FlowRecord,
  PaginationResult,
  SavingAccount,
  User,
  Tag as Itag,
} from '@/types';
import { TagColorMap } from '@/utils/constants';
import { CreditCardOutlined } from '@ant-design/icons';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, Input, InputNumber, Select, Tooltip } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';

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

const CREATE_FLOW_RECORD = gql`
  mutation CreateFlowRecord($flowRecord: FlowRecordInput) {
    createFlowRecord(flowRecord: $flowRecord): Boolean
  }
`;

const Create = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [currentUser] = useAtom(currentUserAtom);

  const [flowRecord, setFlowRecord] = useState<{
    amount?: number;
    desc?: string;
    dealAt?: Dayjs | null;
    tagId?: string;
    savingAccountId?: string;
    trader?: {
      id: string;
      nickname: string;
    };
  }>({
    trader: currentUser!,
    dealAt: dayjs(),
  });

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

  const [createFlowRecord] = useMutation(CREATE_FLOW_RECORD);

  const savingAccounts =
    accountBookWithSavingAccounts?.node.savingAccounts.data || [];

  const tags = accountBookWithTags?.node.tags.data || [];

  const handleFlowRecord = useCallback(async () => {
    await createFlowRecord({
      variables: {
        tagId: flowRecord.tagId,
      },
    });
  }, [createFlowRecord, flowRecord]);

  const selectedTag = tags.find((it) => it.id === flowRecord.tagId);

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
              <InputNumber
                formatter={(value) => `¥ ${value}`}
                precision={2}
                className="w-full"
                min={0}
                value={flowRecord.amount}
                style={{
                  ...(selectedTag && {
                    borderColor: TagColorMap[selectedTag.type].color,
                  }),
                }}
                onChange={(value) =>
                  setFlowRecord((prev) => ({ ...prev, amount: value }))
                }
              />
            </div>
            <div className="table-cell p-2">
              <Input
                className="w-full"
                value={flowRecord.desc}
                onChange={(e) =>
                  setFlowRecord((prev) => ({ ...prev, desc: e.target.value }))
                }
              />
            </div>
            <div className="table-cell p-2">
              <DatePicker
                className="w-full"
                value={flowRecord.dealAt}
                onChange={(value) =>
                  setFlowRecord((prev) => ({ ...prev, dealAt: value }))
                }
              />
            </div>
            <div className="table-cell p-2">
              <Select
                className="w-full"
                value={flowRecord.tagId}
                onChange={(value) =>
                  setFlowRecord((prev) => ({ ...prev, tagId: value }))
                }
              >
                {tags.map((tag) => {
                  return (
                    <Select.Option value={tag.id} key={tag.id}>
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
              <Select
                className="w-full"
                value={flowRecord.savingAccountId}
                onChange={(value) =>
                  setFlowRecord((prev) => ({ ...prev, savingAccountId: value }))
                }
              >
                {savingAccounts.map((it) => {
                  return (
                    <Select.Option value={it.id} key={it.id}>
                      <span className="flex items-center">
                        <CreditCardOutlined />
                        <span className="pl-2">
                          {it.name}(¥{it.amount})
                        </span>
                      </span>
                    </Select.Option>
                  );
                })}
              </Select>
            </div>
            <div className="table-cell p-2">
              <UserSelect
                className="w-full"
                includeSelf={true}
                value={{
                  label: flowRecord.trader!.nickname,
                  value: flowRecord.trader,
                }}
                onChange={(value) =>
                  setFlowRecord((prev) => ({
                    ...prev,
                    trader: (value as ValueType).value,
                  }))
                }
              />
            </div>
            <div className="table-cell p-2">
              <Button type="primary" onClick={handleFlowRecord}>
                保存
              </Button>
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
