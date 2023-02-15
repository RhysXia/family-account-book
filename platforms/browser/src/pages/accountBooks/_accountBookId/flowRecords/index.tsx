import Content from '@/components/Content';
import DatePicker from '@/components/DatePicker';
import Table from '@/components/Table';
import { Column, RenderProps } from '@/components/Table/Cell';
import TagSelect from '@/components/TagSelect';
import {
  FlowRecordDetail,
  useDeleteFlowRecord,
  useGetFlowRecordListByAccountBookId,
  useUpdateFlowRecord,
} from '@/graphql/flowRecord';
import { useGetSavingAccountListByAccountBookId } from '@/graphql/savingAccount';
import { useGetTagsWithCategoryByAccountBookId } from '@/graphql/tag';
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

  const { data: tagsData } = useGetTagsWithCategoryByAccountBookId({
    accountBookId: activeAccountBook!.id!,
  });

  const tags = useMemo(() => tagsData?.data || [], [tagsData]);

  const { getPagination, limit, offset, setPage } = usePagination();

  const [tagIdFilter, setTagIdFilter] = useState<string>();
  const [traderIdFilter, setTraderIdFilter] = useState<string>();
  const [savingAccountIdFilter, setSavingAccountIdFilter] = useState<string>();
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

  const { data } = useGetFlowRecordListByAccountBookId({
    accountBookId: activeAccountBook!.id,
    filter: {
      tagId: tagIdFilter,
      traderId: traderIdFilter,
      savingAccountId: savingAccountIdFilter,
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
        {
          field: 'createdAt',
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
      await deleteFlowRecord({
        variables: {
          id,
        },
      });
    },
    [deleteFlowRecord],
  );

  const columns: Array<Column> = useMemo(
    () => [
      {
        title: '标签',
        dataIndex: 'tag',
        style: {
          minWidth: '15%',
        },
        render({
          value,
          isEdit,
          onChange,
        }: RenderProps<Itag & { category: Category }>) {
          if (isEdit) {
            return (
              <TagSelect
                className="w-full"
                accountBookId={activeAccountBook!.id}
                size="small"
                value={value.id}
                onChange={(id) => onChange(tags.find((it) => it.id === id)!)}
              />
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
        style: {
          minWidth: '10%',
        },
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
                value={value.amount}
                min={type === CategoryType.INCOME ? 0.01 : undefined}
                max={type === CategoryType.EXPENDITURE ? -0.01 : undefined}
                onChange={(v) => onChange({ ...value, amount: v })}
              />
            );
          }
          return <span className="p-2">¥{value.amount.toFixed(2)}</span>;
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
        title: '用途',
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
        title: '账户',
        dataIndex: 'savingAccount',
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
    [tags, savingAccounts, handleDelete, users, activeAccountBook],
  );

  const handleCreate = useCallback(() => {
    setModalVisible(true);
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
      if (tag.category.type === CategoryType.EXPENDITURE && amount >= 0) {
        throw new Error('标签要求流水不能为正');
      } else if (tag.category.type === CategoryType.INCOME && amount <= 0) {
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

  return (
    <Content
      title="流水管理"
      breadcrumbs={breadcrumbs}
      action={
        <Button type="primary" onClick={handleCreate}>
          新建
        </Button>
      }
      pagination={data && getPagination(data.total)}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap -m-2 justify-end">
          <DatePicker.RangePicker
            className="m-2"
            placeholder={['交易开始日期', '交易结束时间']}
            value={dealAtRange}
            onChange={handleChange(setDealAtRange)}
            allowEmpty={[true, true]}
          />
          <TagSelect
            className="m-2"
            allowClear={true}
            value={tagIdFilter}
            onChange={handleChange(setTagIdFilter)}
            placeholder="请选择标签"
            style={{ minWidth: 200 }}
            accountBookId={activeAccountBook!.id}
          />
          <Select
            className="m-2"
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
            className="m-2"
            allowClear={true}
            placeholder="请选择账户"
            style={{ minWidth: 200 }}
            value={savingAccountIdFilter}
            onChange={handleChange(setSavingAccountIdFilter)}
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
        </div>
        <div className="overflow-x-auto">
          <Table
            data={data?.data || []}
            columns={columns}
            editable={true}
            onEditSubmit={handleEditSubmit}
            className="whitespace-nowrap"
          />
        </div>
      </div>
      <CreateModel
        tags={tags}
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
