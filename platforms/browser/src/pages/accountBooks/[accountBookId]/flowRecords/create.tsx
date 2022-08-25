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
import { DatePicker, Input, InputNumber, Select } from 'antd';
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

const GET_SAVING_ACCOUNTS_ACCOUNT_BOOK_ID = gql`
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

const Create = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [currentUser] = useAtom(currentUserAtom);

  const { data: accountBookWithSavingAccounts } = useQuery<{
    node: {
      savingAccounts: PaginationResult<SavingAccount>;
    };
  }>(GET_SAVING_ACCOUNTS_ACCOUNT_BOOK_ID, {
    variables: {
      accountBookId: activeAccountBook!.id,
    },
  });

  const savingAccounts =
    accountBookWithSavingAccounts?.node.savingAccounts.data || [];

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
    <div className="w-1/2 mx-auto bg-white p-6 rounded">
      <div className="table w-full rounded overflow-hidden border-collapse">
        <div className="table-header-group bg-slate-200 font-bold">
          <div className="table-cell p-2 w-1/6">金额</div>
          <div className="table-cell p-2">描述</div>
          <div className="table-cell">日期</div>
          <div className="table-cell">标签</div>
          <div className="table-cell">账户</div>
          <div className="table-cell">交易员</div>
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
                {Object.keys(TagColorMap).map((key) => {
                  return (
                    <Select.Option value={key}>
                      {TagColorMap[key].text}
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
