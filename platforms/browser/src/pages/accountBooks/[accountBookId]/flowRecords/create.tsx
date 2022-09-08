import DatePicker from '@/components/DatePicker';
import Table, { Column, RenderProps } from '@/components/Table';
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
    createFlowRecord(flowRecord: $flowRecord) {
      id
    }
  }
`;

const columns: Array<Column> = [
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
      return <span className="p-2">¥{value}</span>;
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
];

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
    <Table
      data={data?.node.flowRecords.data || []}
      columns={columns}
      editable={true}
    />
  );
};

export default Create;
