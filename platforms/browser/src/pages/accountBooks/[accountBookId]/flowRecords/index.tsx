import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { Button } from 'antd';
import { useAtom } from 'jotai';

import { activeAccountBookAtom } from '../../../../store';
import {
  FlowRecord,
  PaginationResult,
  SavingAccount,
  User,
  Tag as Itag,
} from '../../../../types';
import { TagColorMap } from '../../../../utils/constants';

const CREATE_FLOW_RECORD = gql`
  mutation ($flowRecord: CreateFlowRecordInput!) {
    createFlowRecord(flowRecord: $flowRecord) {
      id
    }
  }
`;

const GET_USER_LIST = gql`
  query findUserListByNameLike($name: String!, $limit: Int!) {
    findUserListByNameLike(name: $name, limit: $limit) {
      value: id
      label: nickname
    }
  }
`;

const GET_FLOW_RECORDS_BY_ACCOUNT_BOOK_ID = gql`
  query getFlowRecordsByAccountBookId(
    $accountBookId: ID!
    $pagination: Pagination
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        flowRecords(pagination: $pagination) {
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
            updater {
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

const FlowRecordsPage = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [createFlowRecord] = useMutation(CREATE_FLOW_RECORD);

  const [searchUsers] = useLazyQuery<{
    findUserListByNameLike: Array<{ label: string; value: string }>;
  }>(GET_USER_LIST);

  const { data, refetch } = useQuery<{
    node: {
      flowRecords: PaginationResult<
        FlowRecord & {
          trader: User;
          updater: User;
          savingAccount: SavingAccount;
          tag: Itag;
        }
      >;
    };
  }>(GET_FLOW_RECORDS_BY_ACCOUNT_BOOK_ID, {
    variables: {
      accountBookId: activeAccountBook?.id,
      pagination: {
        limit: 10,
      },
    },
  });

  return (
    <div className="w-full">
      <div className="bg-white flex flex-row items-center justify-between p-4 mb-4">
        <div></div>
        <div className="">
          <Button type="primary">新建</Button>
        </div>
      </div>
      <table className="table-auto border-collapse w-full text-sm bg-white">
        <thead className="bg-slate-100">
          <tr className="border-b text-slate-400 font-medium">
            <th className="p-4">描述</th>
            <th className="p-4">金额</th>
            <th className="p-4">标签</th>
            <th className="p-4">账户</th>
            <th className="p-4">使用人</th>
            <th className="p-4">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          {data?.node.flowRecords.data.map((it) => {
            return (
              <tr key={it.id}>
                <td>{it.desc}</td>
                <td>{it.amount}</td>
                <td>{it.tag.name}</td>
                <td>{it.trader.nickname}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FlowRecordsPage;
