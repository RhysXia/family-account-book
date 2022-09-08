import Content from '@/components/Content';
import DatePicker from '@/components/DatePicker';
import Table, { Column, RenderProps } from '@/components/Table';
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
import { CreditCardOutlined } from '@ant-design/icons';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, Form, Input, InputNumber, Modal, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { useCallback, useMemo, useState } from 'react';

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

const CREATE_FLOW_RECORD = gql`
  mutation CreateFlowRecord($flowRecord: FlowRecordInput) {
    createFlowRecord(flowRecord: $flowRecord) {
      id
    }
  }
`;

const Create = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [currentUser] = useAtom(currentUserAtom);

  const [modalVisible, setModalVisible] = useState(false);

  const [form] = Form.useForm({});

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
        title: '金额',
        dataIndex: 'amount',
        width: 120,
        render({ value, isEdit, onChange }: RenderProps<number>) {
          if (isEdit) {
            return (
              <InputNumber
                size="small"
                formatter={(value) => `¥ ${value}`}
                precision={2}
                className="w-full"
                min={0}
                value={value}
                onChange={onChange}
              />
            );
          }
          return <span className="p-2">¥{value.toFixed(2)}</span>;
        },
      },
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
                onChange={(value) =>
                  onChange(tags.find((it) => it.id === value) as Itag)
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
          return (
            <span className="p-2">
              {value.name}(￥{value.amount})
            </span>
          );
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
                onChange={(v) => onChange(v!.toString())}
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
                  label: value!.nickname,
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
            <Button danger size="small">
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

  const breadcrumbs = [
    {
      name: activeAccountBook!.name,
      path: `/accountBooks/${activeAccountBook?.id}`,
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
      />
      <Modal visible={modalVisible} title="添加流水">
        <Form
          labelCol={{
            span: 4,
          }}
          form={form}
        >
          <Form.Item label="金额" name="amount" required>
            <InputNumber className="w-full" placeholder="请输入金额" />
          </Form.Item>
          <Form.Item label="标签" name="tagId" required>
            <Select>
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
          </Form.Item>
          <Form.Item label="账户" name="savingAccountId" required>
            <Select>
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
          </Form.Item>
          <Form.Item label="交易时间" name="dealAt" required>
            <DatePicker className="w-full" clearIcon={false} />
          </Form.Item>
          <Form.Item label="交易人员" name="trader" required>
            <UserSelect
              includeSelf={true}
              defaultValue={{
                key: currentUser?.id,
                label: currentUser?.nickname,
                value: currentUser,
              }}
            />
          </Form.Item>
          <Form.Item label="描述" name="desc">
            <Input.TextArea
              autoSize={{ minRows: 3 }}
              placeholder="请输入描述"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};

export default Create;
