import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { Button, Modal, Table, TableColumnsType } from 'antd';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';
import {
  EditableProTable,
  ProCard,
  ProFormField,
  ProFormRadio,
  ProColumns,
} from '@ant-design/pro-components';
import { activeAccountBookAtom } from '../../../../store';
import {
  FlowRecord,
  PaginationResult,
  SavingAccount,
  User,
  Tag as Itag,
} from '../../../../types';

const CREATE_FLOW_RECORD = gql`
  mutation ($flowRecord: CreateFlowRecordInput!) {
    createFlowRecord(flowRecord: $flowRecord) {
      id
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

  const [fetch] = useLazyQuery<{
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

  const [editableKeys, setEditableRowKeys] = useState<Array<React.Key>>([]);

  const columns: Array<ProColumns<any>> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            // setDataSource(dataSource.filter((item) => item.id !== record.id));
          }}
        >
          删除
        </a>,
      ],
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
      <EditableProTable
        rowKey="id"
        columns={columns}
        recordCreatorProps={{
          position: 'top',
          record: () => ({ id: (Math.random() * 1000000).toFixed(0) }),
        }}
        request={async () => {
          const { data } = await fetch();
          const flowRecords = data!.node.flowRecords;
          return {
            total: flowRecords.total,
            data: flowRecords.data,
            success: true,
          };
        }}
        editable={{
          type: 'single',
          editableKeys,
          onChange: setEditableRowKeys,
          onSave: async () => {},
        }}
      />
    </div>
  );
};

export default FlowRecordsPage;
