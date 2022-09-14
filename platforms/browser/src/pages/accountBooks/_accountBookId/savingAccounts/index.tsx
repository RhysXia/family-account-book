import { Button, Input, InputNumber, Modal } from 'antd';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activeAccountBookAtom } from '@/store';
import { SavingAccount } from '@/types';
import { fromTime } from '@/utils/dayjs';
import useGetSavingAccounts from '@/graphql/useGetSavingAccounts';
import useDeleteSavingAccount from '@/graphql/useDeleteSavingAccount';
import CreateModal from './commons/CreateModal';
import usePagination from '@/hooks/usePage';
import Content from '@/components/Content';
import Table from '@/components/Table';
import { Column, RenderProps } from '@/components/Table/Cell';
import useUpdateSavingAccount from '@/graphql/useUpdateSavingAccount';

const SavingAccountPage = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [createModalVisible, setCreateModalVisible] = useState(false);

  const navigate = useNavigate();

  const { getPagination, limit, offset } = usePagination();

  const { data, refetch } = useGetSavingAccounts({
    accountBookId: activeAccountBook!.id,
    pagination: {
      limit,
      offset,
      orderBy: [
        {
          field: 'createdAt',
          direction: 'DESC',
        },
      ],
    },
  });

  const [deleteSavingAccount] = useDeleteSavingAccount();
  const [updateSavingAccount] = useUpdateSavingAccount();

  const handleCreateButton = useCallback(() => {
    setCreateModalVisible(true);
  }, []);

  const handleCreateCancelled = useCallback(() => {
    setCreateModalVisible(false);
  }, []);

  const handleCreated = useCallback(async () => {
    await refetch();
    setCreateModalVisible(false);
  }, [refetch]);

  const handleDeleteSavingAccount = useCallback(
    async (id: string) => {
      await deleteSavingAccount({
        variables: {
          id,
        },
      });
      await refetch();
    },
    [deleteSavingAccount, refetch],
  );

  const handleEdit = useCallback(
    async (value: SavingAccount) => {
      const { id, name, desc, amount } = value;
      await updateSavingAccount({
        variables: {
          savingAccount: {
            id,
            name,
            desc,
            amount,
          },
        },
      });
    },
    [updateSavingAccount],
  );

  const columns: Array<Column> = [
    {
      title: '名称',
      dataIndex: 'name',
      width: '10%',
      render({ value, onChange, isEdit }: RenderProps<string>) {
        if (isEdit) {
          return (
            <Input
              size="small"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          );
        }
        return <span className="p-2">{value}</span>;
      },
    },
    {
      title: '描述',
      dataIndex: 'desc',
      width: '20%',
      render({ value, onChange, isEdit }: RenderProps<string>) {
        if (isEdit) {
          return (
            <Input
              size="small"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          );
        }
        return <span className="p-2">{value}</span>;
      },
    },
    {
      title: '余额',
      dataIndex: 'amount',
      width: '15%',
      render({ value, onChange, isEdit }: RenderProps<number>) {
        if (isEdit) {
          return (
            <InputNumber
              prefix="￥"
              size="small"
              value={value}
              onChange={onChange}
            />
          );
        }
        return (
          <span className="p-2">
            {value.toLocaleString('zh-CN', {
              style: 'currency',
              currency: 'CNY',
            })}
          </span>
        );
      },
    },
    {
      title: '创建人',
      dataIndex: 'creator.nickname',
      width: '15%',
      render({ value }: RenderProps<string>) {
        return value;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: '20%',
      render({ value }: RenderProps<string>) {
        return fromTime(value);
      },
    },
    {
      title: '操作',
      width: '20%',
      render({ value }: RenderProps<SavingAccount>) {
        return (
          <div className="space-x-4">
            <Button
              size="small"
              type="primary"
              onClick={() => {
                navigate(`${value.id}`);
              }}
            >
              详情
            </Button>
            <Button
              size="small"
              type="primary"
              danger={true}
              onClick={() => {
                Modal.confirm({
                  title: '确认删除',
                  content: '确认删除该存款账户吗？',
                  onOk: async () => {
                    await handleDeleteSavingAccount(value.id);
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

  const breadcrumbs = [
    {
      name: activeAccountBook!.name,
      path: `/accountBooks/${activeAccountBook!.id}`,
    },
    {
      name: '账户列表',
    },
  ];

  return (
    <Content
      breadcrumbs={breadcrumbs}
      pagination={data && getPagination(data.node.savingAccounts.total)}
      action={
        <Button type="primary" onClick={handleCreateButton}>
          新建
        </Button>
      }
      title="账户列表"
    >
      <Table
        columns={columns}
        editable={true}
        data={data?.node.savingAccounts.data || []}
        onEditSubmit={handleEdit}
      />
      <CreateModal
        visible={createModalVisible}
        onCancelled={handleCreateCancelled}
        onCreated={handleCreated}
      />
    </Content>
  );
};

export default SavingAccountPage;
