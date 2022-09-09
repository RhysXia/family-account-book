import Content from '@/components/Content';
import DatePicker from '@/components/DatePicker';
import Table from '@/components/Table';
import { Column, RenderProps } from '@/components/Table/Cell';
import UserSelect from '@/components/UserSelect';
import { activeAccountBookAtom } from '@/store';
import {
  FlowRecord,
  PaginationResult,
  SavingAccount,
  User,
  Tag as Itag,
  TagType,
  AccountBook,
} from '@/types';
import { TagColorMap } from '@/utils/constants';
import { CreditCardOutlined } from '@ant-design/icons';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, Input, InputNumber, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import CreateModel from './commons/CreateModel';

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
              amount
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

const UPDATE_FLOW_RECORD = gql`
  mutation UpdateFlowRecord($flowRecord: UpdateFlowRecordInput!) {
    updateFlowRecord(flowRecord: $flowRecord) {
      id
    }
  }
`;

type FlowRecordDetail = FlowRecord & {
  trader: User;
  savingAccount: SavingAccount;
  tag: Itag;
};

type UpdateFlowRecordInput = {
  id: string;
  desc?: string;
  dealAt?: string;
  amount?: number;
  savingAccountId?: string;
  tagId?: string;
  traderId?: string;
};

const Index = () => {
  const [_activeAccountBook] = useAtom(activeAccountBookAtom);

  const activeAccountBook = _activeAccountBook as AccountBook;

  const [modalVisible, setModalVisible] = useState(false);

  const [uploadFlowRecord] = useMutation<
    any,
    {
      flowRecord: UpdateFlowRecordInput;
    }
  >(UPDATE_FLOW_RECORD);

  const { data: accountBookWithSavingAccounts } = useQuery<{
    node: {
      savingAccounts: PaginationResult<SavingAccount>;
    };
  }>(GET_SAVING_ACCOUNTS_BY_ACCOUNT_BOOK_ID, {
    variables: {
      accountBookId: activeAccountBook.id,
    },
  });

  const { data: accountBookWithTags } = useQuery<{
    node: {
      tags: PaginationResult<Itag>;
    };
  }>(GET_TAGS_BY_ACCOUNT_BOOK_ID, {
    variables: {
      accountBookId: activeAccountBook.id,
    },
  });

  const { data, refetch } = useQuery<{
    node: {
      flowRecords: PaginationResult<FlowRecordDetail>;
    };
  }>(GET_SELF_FLOW_RECORDS, {
    variables: {
      accountBookId: activeAccountBook?.id,
      pagination: {
        limit: 10,
        orderBy: [
          {
            field: 'dealAt',
            direction: 'DESC',
          },
          {
            field: 'updatedAt',
            direction: 'DESC',
          },
        ],
      },
    },
  });

  const savingAccounts = useMemo(
    () => accountBookWithSavingAccounts?.node.savingAccounts.data || [],
    [accountBookWithSavingAccounts],
  );

  const tags = useMemo(
    () => accountBookWithTags?.node.tags.data || [],
    [accountBookWithTags],
  );

  const columns: Array<Column> = useMemo(
    () => [
      {
        title: '标签',
        dataIndex: 'tag',
        width: 120,
        render({ value, isEdit, onChange }: RenderProps<Itag>) {
          if (isEdit) {
            return (
              <Select
                size="small"
                className="w-full"
                value={value.id}
                onChange={(v) =>
                  onChange(tags.find((it) => it.id === v) as Itag)
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
            );
          }
          return (
            <span
              className="inline-block leading-4 rounded px-2 py-1 text-white"
              style={{ background: TagColorMap[value.type].color }}
            >
              {value.name}
            </span>
          );
        },
      },
      {
        title: '金额',
        width: 120,
        render({
          value,
          isEdit,
          onChange,
        }: RenderProps<
          FlowRecord & {
            tag: Itag;
          }
        >) {
          const tagType = value.tag.type;
          if (isEdit) {
            return (
              <InputNumber
                size="small"
                formatter={(v) => `¥ ${v}`}
                precision={2}
                className="w-full"
                value={value.amount}
                min={tagType === TagType.INCOME ? 0.01 : undefined}
                max={tagType === TagType.EXPENDITURE ? -0.01 : undefined}
                onChange={(v) => onChange({ ...value, amount: v })}
              />
            );
          }
          return <span className="p-2">¥{value.amount.toFixed(2)}</span>;
        },
      },
      {
        title: '账户',
        dataIndex: 'savingAccount',
        width: 160,
        render({ value, isEdit, onChange }: RenderProps<SavingAccount>) {
          if (isEdit) {
            return (
              <Select
                size="small"
                className="w-full"
                value={value.id}
                onChange={(v) =>
                  onChange(
                    savingAccounts.find((it) => it.id === v) as SavingAccount,
                  )
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
            );
          }
          return <span className="p-2">{value.name}</span>;
        },
      },
      {
        title: '交易日期',
        dataIndex: 'dealAt',
        width: 150,
        render({ value, isEdit, onChange }: RenderProps<string>) {
          if (isEdit) {
            return (
              <DatePicker
                clearIcon={false}
                size="small"
                className="w-full"
                value={dayjs(value)}
                onChange={(v) => onChange((v as Dayjs).toString())}
              />
            );
          }
          return (
            <span className="p-2">{dayjs(value).format('YYYY-MM-DD')}</span>
          );
        },
      },
      {
        title: '交易人员',
        dataIndex: 'trader',
        width: 120,
        render({ value, isEdit, onChange }: RenderProps<User>) {
          if (isEdit) {
            return (
              <UserSelect
                size="small"
                className="w-full"
                includeSelf={true}
                value={{
                  key: value.id,
                  label: value.nickname,
                  value: value,
                }}
                onChange={onChange as any}
              />
            );
          }
          return <span className="p-2">{value.nickname}</span>;
        },
      },
      {
        title: '描述',
        dataIndex: 'desc',
        render({ value, isEdit, onChange }: RenderProps<string>) {
          if (isEdit) {
            return (
              <Input
                size="small"
                className="w-full"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            );
          }
          return <span className="p-2">{value}</span>;
        },
      },
      {
        title: '操作',
        width: 100,
        render({ value }: RenderProps<FlowRecord>) {
          return (
            <Button danger={true} size="small">
              删除
            </Button>
          );
        },
      },
    ],
    [tags, savingAccounts],
  );

  const handleCreate = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleCreated = useCallback(async () => {
    refetch();
    setModalVisible(false);
  }, [refetch]);

  const handleCancelled = useCallback(async () => {
    setModalVisible(false);
  }, []);

  const handleEditSubmit = useCallback(
    async ({
      id,
      amount,
      desc,
      dealAt,
      savingAccount,
      tag,
      trader,
    }: FlowRecordDetail) => {
      if (tag.type === TagType.EXPENDITURE && amount >= 0) {
        throw new Error('标签类型为支出的时候，金额需要为负数');
      } else if (tag.type === TagType.INCOME && amount <= 0) {
        throw new Error('标签类型为收入的时候，金额需要为正数');
      }

      await uploadFlowRecord({
        variables: {
          flowRecord: {
            id,
            amount,
            desc,
            dealAt,
            savingAccountId: savingAccount.id,
            tagId: tag.id,
            traderId: trader.id,
          },
        },
      });
    },
    [uploadFlowRecord],
  );

  const breadcrumbs = [
    {
      name: activeAccountBook.name,
      path: `/accountBooks/${activeAccountBook.id}`,
    },
    {
      name: '流水记录',
    },
  ];

  return (
    <Content
      title="流水记录"
      breadcrumbs={breadcrumbs}
      action={
        <Button type="primary" onClick={handleCreate}>
          新建
        </Button>
      }
    >
      <Table
        data={data?.node.flowRecords.data || []}
        columns={columns}
        editable={true}
        onEditSubmit={handleEditSubmit}
      />
      <CreateModel
        onCreated={handleCreated}
        onCancelled={handleCancelled}
        visible={modalVisible}
        tags={tags}
        savingAccounts={savingAccounts}
      />
    </Content>
  );
};

export default Index;
