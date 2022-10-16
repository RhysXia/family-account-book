import Content from '@/components/Content';
import DatePicker from '@/components/DatePicker';
import Table from '@/components/Table';
import { Column, RenderProps } from '@/components/Table/Cell';
import { useGetSavingAccountListByAccountBookId } from '@/graphql/savingAccount';
import {
  TransferRecordDetail,
  useDeleteTransferRecord,
  useGetTransferRecordListByAccountBookId,
  useUpdateTransferRecord,
} from '@/graphql/transferRecord';
import usePagination from '@/hooks/usePage';
import { activeAccountBookAtom } from '@/store';
import { FlowRecord, SavingAccount, User } from '@/types';
import { CreditCardOutlined } from '@ant-design/icons';
import { Button, Input, InputNumber, Modal, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import CreateModel from './commons/CreateModel';

const Index = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [modalVisible, setModalVisible] = useState(false);

  const [updateTransferRecord] = useUpdateTransferRecord();

  const [deleteTransferRecord] = useDeleteTransferRecord();

  const users = useMemo(() => {
    const { members, admins } = activeAccountBook!;
    return [...admins, ...members];
  }, [activeAccountBook]);

  const {
    data: accountBookWithSavingAccounts,
    refetch: refetchSavingAccounts,
  } = useGetSavingAccountListByAccountBookId({
    accountBookId: activeAccountBook!.id!,
  });

  const { getPagination, limit, offset, setPage } = usePagination();

  const [traderIdFilter, setTraderIdFilter] = useState<string>();

  const [fromSavingAccountIdFilter, setFromSavingAccountIdFilter] =
    useState<string>();
  const [toSavingAccountIdFilter, setToSavingAccountIdFilter] =
    useState<string>();

  const [dealAtRange, setDealAtRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >();

  const handleChange = useCallback(
    (fn: (any) => void) => {
      return (args: any) => {
        fn(args);
        setPage(1);
      };
    },
    [setPage],
  );

  const { data } = useGetTransferRecordListByAccountBookId({
    accountBookId: activeAccountBook!.id,
    filter: {
      traderId: traderIdFilter,
      fromSavingAccountId: fromSavingAccountIdFilter,
      toSavingAccountId: toSavingAccountIdFilter,
      startDealAt: dealAtRange?.[0]?.format('YYYY-MM-DD'),
      endDealAt: dealAtRange?.[1]?.format('YYYY-MM-DD'),
    },
    pagination: {
      limit,
      offset,
      orderBy: [
        {
          field: 'dealAt',
          direction: 'DESC',
        },
      ],
    },
  });

  const savingAccounts = useMemo(
    () => accountBookWithSavingAccounts?.data || [],
    [accountBookWithSavingAccounts],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTransferRecord({
        variables: {
          id,
        },
      });
    },
    [deleteTransferRecord],
  );

  const handleRefreshSavingAccounts = useCallback(async () => {
    await refetchSavingAccounts();
  }, [refetchSavingAccounts]);

  const columns: Array<Column> = useMemo(
    () => [
      {
        title: '金额',
        style: {
          minWidth: '10%',
        },
        dataIndex: 'amount',
        render({ value, isEdit, onChange }: RenderProps<number>) {
          if (isEdit) {
            return (
              <InputNumber
                size="small"
                formatter={(v) => `¥ ${v}`}
                precision={2}
                value={value}
                min={0.01}
                onChange={onChange}
              />
            );
          }
          return <span className="p-2">¥{value.toFixed(2)}</span>;
        },
      },
      {
        title: '原账户',
        dataIndex: 'from',
        style: {
          minWidth: '20%',
        },
        render({ value, isEdit, onChange }: RenderProps<SavingAccount>) {
          if (isEdit) {
            return (
              <Select
                size="small"
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
          return <span className="p-2">{value.name}</span>;
        },
      },
      {
        title: '目标账户',
        dataIndex: 'to',
        style: {
          minWidth: '20%',
        },
        render({ value, isEdit, onChange }: RenderProps<SavingAccount>) {
          if (isEdit) {
            return (
              <Select
                size="small"
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
          return <span className="p-2">{value.name}</span>;
        },
      },
      {
        title: '交易日期',
        dataIndex: 'dealAt',
        style: {
          minWidth: '10%',
        },
        render({ value, isEdit, onChange }: RenderProps<string>) {
          if (isEdit) {
            return (
              <DatePicker
                clearIcon={false}
                size="small"
                value={dayjs(value)}
                onChange={(v) => onChange((v as Dayjs).toString())}
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
        style: {
          minWidth: '10%',
        },
        render({ value, isEdit, onChange }: RenderProps<User>) {
          if (isEdit) {
            return (
              <Select
                size="small"
                value={value.id}
                onChange={(v) => onChange(users.find((it) => it.id === v)!)}
              >
                {users.map((it) => {
                  return (
                    <Select.Option value={it.id} key={it.id}>
                      <span className="flex items-center">{it.nickname}</span>
                    </Select.Option>
                  );
                })}
              </Select>
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
        style: {
          minWidth: '15%',
        },
        render({ value }: RenderProps<FlowRecord>) {
          return (
            <Button
              danger={true}
              size="small"
              onClick={() => {
                Modal.confirm({
                  title: '确认删除',
                  content: '确认删除该存款账户吗？',
                  onOk: async () => {
                    await handleDelete(value.id);
                  },
                });
              }}
            >
              删除
            </Button>
          );
        },
      },
    ],
    [savingAccounts, handleDelete, users],
  );

  const handleCreate = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleEditSubmit = useCallback(
    async ({
      id,
      amount,
      desc,
      dealAt,
      from,
      to,
      trader,
    }: TransferRecordDetail) => {
      if (amount <= 0) {
        throw new Error('标签要求流水不能为负');
      }

      await updateTransferRecord({
        variables: {
          record: {
            id,
            amount,
            desc,
            dealAt,
            fromSavingAccountId: from.id,
            toSavingAccountId: to.id,
            traderId: trader.id,
          },
        },
      });
    },
    [updateTransferRecord],
  );

  const breadcrumbs = [
    {
      name: activeAccountBook!.name,
      path: `/accountBooks/${activeAccountBook!.id}`,
    },
    {
      name: '转账管理',
    },
  ];

  return (
    <Content
      title="转账管理"
      breadcrumbs={breadcrumbs}
      action={
        <Button type="primary" onClick={handleCreate}>
          新建
        </Button>
      }
      pagination={data && getPagination(data.total)}
    >
      <div className="space-y-2">
        <div className="flex justify-end space-x-2">
          <Select
            style={{ minWidth: 200 }}
            allowClear={true}
            placeholder="请选择交易人员"
            value={traderIdFilter}
            onChange={handleChange(setTraderIdFilter)}
          >
            {users.map((it) => {
              return (
                <Select.Option value={it.id} key={it.id}>
                  <span className="flex items-center">{it.nickname}</span>
                </Select.Option>
              );
            })}
          </Select>
          <Select
            allowClear={true}
            placeholder="请选择原账户"
            style={{ minWidth: 250 }}
            value={fromSavingAccountIdFilter}
            onChange={handleChange(setFromSavingAccountIdFilter)}
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
          <Select
            allowClear={true}
            placeholder="请选择目标账户"
            style={{ minWidth: 250 }}
            value={toSavingAccountIdFilter}
            onChange={handleChange(setToSavingAccountIdFilter)}
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
          <DatePicker.RangePicker
            placeholder={['交易开始日期', '交易结束时间']}
            value={dealAtRange}
            onChange={handleChange(setDealAtRange)}
            allowEmpty={[true, true]}
          />
        </div>
        <Table
          data={data?.data || []}
          columns={columns}
          editable={true}
          onEditSubmit={handleEditSubmit}
        />
      </div>
      <CreateModel
        users={users}
        onChange={setModalVisible}
        onRefrshSavingAccounts={handleRefreshSavingAccounts}
        visible={modalVisible}
        savingAccounts={savingAccounts}
      />
    </Content>
  );
};

export default Index;
