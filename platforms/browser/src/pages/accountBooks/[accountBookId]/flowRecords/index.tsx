import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, Modal, Table, TableColumnsType } from 'antd';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { activeAccountBookAtom } from '../../../../store';
import {
  FlowRecord,
  PaginationResult,
  SavingAccount,
  User,
  Tag as Itag,
} from '../../../../types';
import { fromTime } from '../../../../utils/dayjs';

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

const DELETE_FLOW_RECORD = gql`
  mutation deleteFlowRecord($id: ID!) {
    deleteFlowRecord(id: $id)
    Boolean
  }
`;

const FlowRecordsPage = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);
  const navigate = useNavigate();

  const [createModalVisible, setCreateModalVisible] = useState(false);

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

  const [deleteFlowRecord] = useMutation<{ tagId: number }>(DELETE_FLOW_RECORD);

  const handleCreateButton = useCallback(() => {
    setCreateModalVisible(true);
  }, []);

  const handleDeleteTag = useCallback(
    async (id: string) => {
      await deleteFlowRecord({
        variables: {
          tagId: id,
        },
      });
      await refetch();
    },
    [deleteFlowRecord, refetch],
  );

  const columns: TableColumnsType<any> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      render(creator: User) {
        return creator.nickname;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render(createdAt: string) {
        return fromTime(createdAt);
      },
    },
    {
      title: '操作',
      render(record: FlowRecord) {
        return (
          <div className="space-x-4">
            <Button
              size="small"
              type="primary"
              onClick={() => {
                navigate(`${record.id}`);
              }}
            >
              详情
            </Button>
            <Button
              size="small"
              type="primary"
              danger
              onClick={() => {
                Modal.confirm({
                  title: '确认删除',
                  content: '确认删除该流水吗？',
                  onOk: async () => {
                    await handleDeleteTag(record.id);
                  },
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
          <Button type="primary" onClick={handleCreateButton}>
            新建
          </Button>
        </div>
      </div>
      <Table
        pagination={false}
        columns={columns}
        dataSource={data?.node.flowRecords.data.map((it) => ({
          ...it,
          key: it.id,
        }))}
      />
    </div>
  );
};

export default FlowRecordsPage;
