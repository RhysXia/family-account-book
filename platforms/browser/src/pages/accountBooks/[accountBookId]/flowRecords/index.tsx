import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, Modal, Table, TableColumnsType } from 'antd';
import { useAtom } from 'jotai';
import { activeAccountBookAtom } from '../../../../store';
import {
  FlowRecord,
  PaginationResult,
  SavingAccount,
  User,
  Tag as Itag,
} from '../../../../types';
import { fromTime } from '../../../../utils/dayjs';

const CREATE_FLOW_RECORD = gql`
  mutation ($flowRecord: CreateFlowRecordInput!) {
    createFlowRecord(flowRecord: $flowRecord) {
      id
    }
  }
`;

const GET_FLOW_RECORDS_BY_ACCOUNT_BOOK_ID = gql`
  query ($accountBookId: Int!, $pagination: Pagination) {
    getAuthAccountBookById(id: $accountBookId) {
      id
      flowRecords(pagination: $pagination) {
        total
        data {
          id
          desc
          createdAt
          updatedAt
          dealAt
          creator {
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
`;

const FlowRecordsPage = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [createFlowRecord] = useMutation(CREATE_FLOW_RECORD);

  const { data, loading, error } = useQuery<{
    getAuthAccountBookById: {
      flowRecords: PaginationResult<
        FlowRecord & {
          creator: User;
          savingAccount: SavingAccount;
          tag: Itag;
        }
      >;
    };
  }>(GET_FLOW_RECORDS_BY_ACCOUNT_BOOK_ID, {
    variables: {
      accountBookId: activeAccountBook!.id,
      pagination: {
        limit: 10,
      },
    },
  });

  const columns: TableColumnsType<any> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },

    {
      title: '操作',
      render(record: FlowRecord) {
        return (
          <div className="space-x-4">
            <Button size="small" type="primary" onClick={() => {}}>
              详情
            </Button>
            <Button
              size="small"
              type="primary"
              danger
              onClick={() => {
                Modal.confirm({
                  title: '确认删除',
                  content: '确认删除该流水记录吗？',
                  onOk: async () => {},
                });
              }}
            >
              删除
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full">
      <div className="bg-white flex flex-row items-center justify-between p-4 mb-4">
        <div></div>
        <div className="">
          <Button type="primary">新建</Button>
        </div>
      </div>
      <Table
        pagination={false}
        columns={columns}
        dataSource={data?.getAuthAccountBookById.flowRecords.data.map((it) => ({
          ...it,
          key: it.id,
        }))}
      />
    </div>
  );
};

export default FlowRecordsPage;
