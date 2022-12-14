import { Button, Input, InputNumber, Modal } from 'antd';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activeAccountBookAtom } from '@/store';
import { SavingAccount } from '@/types';
import { fromTime } from '@/utils/dayjs';
import CreateModal from './commons/CreateModal';
import usePagination from '@/hooks/usePage';
import Content from '@/components/Content';
import Table from '@/components/Table';
import { Column, RenderProps } from '@/components/Table/Cell';
import {
  useUpdateSavingAccount,
  useDeleteSavingAccountById,
  useGetSavingAccountListByAccountBookId,
} from '@/graphql/savingAccount';

const SavingAccountPage = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [createModalVisible, setCreateModalVisible] = useState(false);

  const navigate = useNavigate();

  const { getPagination, limit, offset } = usePagination();

  const { data } = useGetSavingAccountListByAccountBookId({
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

  const [deleteSavingAccount] = useDeleteSavingAccountById();
  const [updateSavingAccount] = useUpdateSavingAccount();

  const handleCreateButton = useCallback(() => {
    setCreateModalVisible(true);
  }, []);

  const handleDeleteSavingAccount = useCallback(
    async (id: string) => {
      await deleteSavingAccount({
        variables: {
          id,
        },
      });
    },
    [deleteSavingAccount],
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
      title: '??????',
      dataIndex: 'name',
      style: {
        minWidth: '10%',
      },
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
      title: '??????',
      dataIndex: 'desc',
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
      title: '??????',
      dataIndex: 'amount',
      style: {
        minWidth: '15%',
      },
      render({ value, onChange, isEdit }: RenderProps<number>) {
        if (isEdit) {
          return (
            <InputNumber
              prefix="???"
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
      title: '?????????',
      dataIndex: 'creator.nickname',
      style: {
        minWidth: '10%',
      },
      render({ value }: RenderProps<string>) {
        return value;
      },
    },
    {
      title: '????????????',
      dataIndex: 'createdAt',
      style: {
        minWidth: '15%',
      },
      render({ value }: RenderProps<string>) {
        return fromTime(value);
      },
    },
    {
      title: '??????',
      style: {
        minWidth: '15%',
      },
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
              ??????
            </Button>
            <Button
              size="small"
              type="primary"
              danger={true}
              onClick={() => {
                Modal.confirm({
                  title: '????????????',
                  content: '?????????????????????????????????',
                  onOk: async () => {
                    await handleDeleteSavingAccount(value.id);
                  },
                });
              }}
            >
              ??????
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
      name: '????????????',
    },
  ];

  return (
    <Content
      breadcrumbs={breadcrumbs}
      pagination={data && getPagination(data.total)}
      action={
        <Button type="primary" onClick={handleCreateButton}>
          ??????
        </Button>
      }
      title="????????????"
    >
      <Table
        columns={columns}
        editable={true}
        data={data?.data || []}
        onEditSubmit={handleEdit}
      />
      <CreateModal
        visible={createModalVisible}
        onChange={setCreateModalVisible}
      />
    </Content>
  );
};

export default SavingAccountPage;
