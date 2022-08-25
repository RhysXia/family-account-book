import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, Form, Input, InputNumber, Modal, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activeAccountBookAtom } from '@/store';
import { PaginationResult, SavingAccount, User } from '@/types';
import { fromTime } from '@/utils/dayjs';

const GET_SAVING_ACCOUNTS = gql`
  query getSavingAccountsByAccountBookId($accountBookId: ID!) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        savingAccounts(
          pagination: { orderBy: { field: "updatedAt", direction: DESC } }
        ) {
          total
          data {
            id
            name
            desc
            amount
            createdAt
            updatedAt
            creator {
              id
              username
              nickname
            }
          }
        }
      }
    }
  }
`;

const CREATE_SAVING_ACCOUNT = gql`
  mutation (
    $name: String!
    $desc: String
    $amount: Float!
    $accountBookId: ID!
  ) {
    createSavingAccount(
      savingAccount: {
        name: $name
        desc: $desc
        amount: $amount
        accountBookId: $accountBookId
      }
    ) {
      id
      name
      desc
      amount
      createdAt
      updatedAt
    }
  }
`;

const DELETE_SAVING_ACCOUNT = gql`
  mutation Mutation($savingAccountId: ID!) {
    deleteSavingAccount(id: $savingAccountId)
  }
`;

const SavingAccountPage = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [form] = Form.useForm();

  const [createModalVisible, setCreateModalVisible] = useState(false);

  const navigate = useNavigate();

  const { data, refetch } = useQuery<{
    node: {
      savingAccounts: PaginationResult<
        SavingAccount & {
          creator: User;
        }
      >;
    };
  }>(GET_SAVING_ACCOUNTS, {
    variables: {
      accountBookId: activeAccountBook?.id,
    },
  });

  const [createSavingAccount] = useMutation<{
    createSavingAccount: SavingAccount;
  }>(CREATE_SAVING_ACCOUNT);

  const [deleteSavingAccount] = useMutation(DELETE_SAVING_ACCOUNT);

  const handleOk = useCallback(async () => {
    await form.validateFields();
    await createSavingAccount({
      variables: {
        ...form.getFieldsValue(),
        accountBookId: activeAccountBook?.id,
      },
    });

    await refetch();

    setCreateModalVisible(false);
    form.resetFields();
  }, [form, refetch, activeAccountBook, createSavingAccount]);

  const handleCancel = useCallback(() => {
    setCreateModalVisible(false);
    form.resetFields();
  }, [form]);

  const handleCreateButton = useCallback(() => {
    setCreateModalVisible(true);
  }, []);

  const handleDeleteSavingAccount = useCallback(
    async (id: string) => {
      await deleteSavingAccount({
        variables: {
          savingAccountId: id,
        },
      });
      await refetch();
    },
    [deleteSavingAccount, refetch],
  );

  const columns: ColumnsType<any> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
    },
    {
      title: '余额',
      dataIndex: 'amount',
      key: 'amount',
      render(amount: number) {
        return `￥${amount.toLocaleString()}`;
      },
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
      render(record: SavingAccount) {
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
                  content: '确认删除该存款账户吗？',
                  onOk: async () => {
                    await handleDeleteSavingAccount(record.id);
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

  const title = <h1 className="font-bold text-xl mb-2">新建储蓄账户</h1>;

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
        dataSource={data?.node.savingAccounts.data.map((it) => ({
          ...it,
          key: it.id,
        }))}
      />
      <Modal
        visible={createModalVisible}
        title={title}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} labelCol={{ span: 3 }}>
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '名称不能为空' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="描述" name="desc">
            <Input.TextArea autoSize={{ minRows: 4 }} />
          </Form.Item>
          <Form.Item
            label="余额"
            name="amount"
            rules={[{ required: true, message: '金额不能为空' }]}
          >
            <InputNumber addonBefore="￥" precision={2} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SavingAccountPage;