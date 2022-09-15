import Content from '@/components/Content';
import DatePicker from '@/components/DatePicker';
import Table from '@/components/Table';
import { Column, RenderProps } from '@/components/Table/Cell';
import { useGetSavingAccountListByAccountBookId } from '@/graphql/savingAccount';
import useDeleteFlowRecord from '@/graphql/useDeleteFlowRecord';
import useGetFlowRecords, {
  FlowRecordDetail,
} from '@/graphql/useGetFlowRecords';
import { useGetTagsWithCategory } from '@/graphql/useGetTags';
import useUpdateFlowRecord from '@/graphql/useUpdateFlowRecord';
import usePagination from '@/hooks/usePage';
import { activeAccountBookAtom } from '@/store';
import {
  FlowRecord,
  SavingAccount,
  User,
  Tag as Itag,
  Category,
  CategoryType,
} from '@/types';
import { CategoryTypeInfoMap } from '@/utils/constants';
import { CreditCardOutlined } from '@ant-design/icons';
import { Button, Input, InputNumber, Modal, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import CreateModel from './commons/CreateModel';

const Index = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [modalVisible, setModalVisible] = useState(false);

  const [uploadFlowRecord] = useUpdateFlowRecord();

  const [deleteFlowRecord] = useDeleteFlowRecord();

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

  const { data: tagsData } = useGetTagsWithCategory({
    accountBookId: activeAccountBook!.id!,
  });

  const { getPagination, limit, offset } = usePagination();

  const { data, refetch } = useGetFlowRecords({
    accountBookId: activeAccountBook!.id,
    pagination: {
      limit,
      offset,
      orderBy: [
        {
          field: 'dealAt',
          direction: 'DESC',
        },
        {
          field: 'updatedAt',
          direction: 'DESC',
        },
      ],
    },
  });

  const savingAccounts = useMemo(
    () => accountBookWithSavingAccounts?.data || [],
    [accountBookWithSavingAccounts],
  );

  const tags = useMemo(() => tagsData?.node.tags.data || [], [tagsData]);

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteFlowRecord({
        variables: {
          id,
        },
      });
      await refetch();
    },
    [deleteFlowRecord, refetch],
  );

  const columns: Array<Column> = useMemo(
    () => [
      {
        title: '标签',
        dataIndex: 'tag',
        width: '10%',
        render({
          value,
          isEdit,
          onChange,
        }: RenderProps<Itag & { category: Category }>) {
          if (isEdit) {
            return (
              <Select
                size="small"
                className="w-full"
                value={value.id}
                onChange={(v) => onChange(tags.find((it) => it.id === v)!)}
              >
                {tags.map((tag) => {
                  return (
                    <Select.Option value={tag.id} key={tag.id}>
                      <span
                        className="inline-block leading-4 rounded px-2 py-1 text-white"
                        style={{
                          background:
                            CategoryTypeInfoMap[tag.category.type].color,
                        }}
                      >
                        {tag.name}
                      </span>
                    </Select.Option>
                  );
                })}
              </Select>
            );
          }
          return (
            <span
              className="inline-block leading-4 rounded px-2 py-1 text-white"
              style={{
                background: CategoryTypeInfoMap[value.category.type].color,
              }}
            >
              {value.name}
            </span>
          );
        },
      },
      {
        title: '金额',
        width: '10%',
        render({
          value,
          isEdit,
          onChange,
        }: RenderProps<
          FlowRecord & {
            tag: Itag & {
              category: Category;
            };
          }
        >) {
          const type = value.tag.category.type;
          if (isEdit) {
            return (
              <InputNumber
                size="small"
                formatter={(v) => `¥ ${v}`}
                precision={2}
                className="w-full"
                value={value.amount}
                min={type === CategoryType.POSITIVE_AMOUNT ? 0.01 : undefined}
                max={type === CategoryType.NEGATIVE_AMOUNT ? -0.01 : undefined}
                onChange={(v) => onChange({ ...value, amount: v })}
              />
            );
          }
          return <span className="p-2">¥{value.amount.toFixed(2)}</span>;
        },
      },
      {
        title: '账户',
        dataIndex: 'savingAccount',
        width: '15%',
        render({ value, isEdit, onChange }: RenderProps<SavingAccount>) {
          if (isEdit) {
            return (
              <Select
                size="small"
                className="w-full"
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
        width: '15%',
        render({ value, isEdit, onChange }: RenderProps<string>) {
          if (isEdit) {
            return (
              <DatePicker
                clearIcon={false}
                size="small"
                className="w-full"
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
        width: '10%',
        render({ value, isEdit, onChange }: RenderProps<User>) {
          if (isEdit) {
            return (
              <Select
                size="small"
                className="w-full"
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
        width: '20%',
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
      {
        title: '操作',
        width: '20%',
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
    [tags, savingAccounts, handleDelete, users],
  );

  const handleCreate = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleCreated = useCallback(async () => {
    await refetch();
    setModalVisible(false);
  }, [refetch]);

  const handleCancelled = useCallback(async () => {
    setModalVisible(false);
  }, []);

  const handleRefreshSavingAccounts = useCallback(async () => {
    await refetchSavingAccounts();
  }, [refetchSavingAccounts]);

  const handleEditSubmit = useCallback(
    async ({
      id,
      amount,
      desc,
      dealAt,
      savingAccount,
      tag,
      trader,
    }: FlowRecordDetail) => {
      if (tag.category.type === CategoryType.NEGATIVE_AMOUNT && amount >= 0) {
        throw new Error('标签要求流水不能为正');
      } else if (
        tag.category.type === CategoryType.POSITIVE_AMOUNT &&
        amount <= 0
      ) {
        throw new Error('标签要求流水不能为负');
      }

      await uploadFlowRecord({
        variables: {
          flowRecord: {
            id,
            amount,
            desc,
            dealAt,
            savingAccountId: savingAccount.id,
            tagId: tag.id,
            traderId: trader.id,
          },
        },
      });
    },
    [uploadFlowRecord],
  );

  const breadcrumbs = [
    {
      name: activeAccountBook!.name,
      path: `/accountBooks/${activeAccountBook!.id}`,
    },
    {
      name: '流水记录',
    },
  ];

  const pagination = data && getPagination(data.node.flowRecords.total);

  return (
    <Content
      title="流水管理"
      breadcrumbs={breadcrumbs}
      action={
        <Button type="primary" onClick={handleCreate}>
          新建
        </Button>
      }
      pagination={pagination}
    >
      <Table
        data={data?.node.flowRecords.data || []}
        columns={columns}
        editable={true}
        onEditSubmit={handleEditSubmit}
      />
      <CreateModel
        users={users}
        onCreated={handleCreated}
        onCancelled={handleCancelled}
        onRefrshSavingAccounts={handleRefreshSavingAccounts}
        visible={modalVisible}
        tags={tags}
        savingAccounts={savingAccounts}
      />
    </Content>
  );
};

export default Index;
