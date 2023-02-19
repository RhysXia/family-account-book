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
  Category,
  FlowRecord,
  CategoryType,
  User,
  SavingAccount,
  Tag as Itag,
} from '@/types';
import { CategoryTypeInfoMap } from '@/utils/constants';
import { CreditCardOutlined } from '@ant-design/icons';
import {
  Tag,
  InputNumber,
  Select,
  Input,
  DatePicker,
  Button,
  Modal,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react';
import Table from '../Table';
import { Column, RenderProps } from '../Table/Cell';
import TagSelect from '../TagSelect';

export type FlowRecordTableProps = {
  tagId?: string;
  categoryId?: string;
  traderId?: string;
  savingAccountId?: string;
  startDealAt?: string;
  endDealAt?: string;
};

export type FlowRecordTableRef = {
  setPage: (page: number) => void;
};

const FlowRecordTable = forwardRef<FlowRecordTableRef, FlowRecordTableProps>(
  (
    { tagId, categoryId, traderId, savingAccountId, startDealAt, endDealAt },
    ref,
  ) => {
    const [activeAccountBook] = useAtom(activeAccountBookAtom);

    const { getPagination, limit, offset, setPage } = usePagination();

    useImperativeHandle(ref, () => {
      return {
        setPage,
      };
    });

    const { data: accountBookWithSavingAccounts } =
      useGetSavingAccountListByAccountBookId({
        accountBookId: activeAccountBook!.id!,
      });

    const { data: tagsData } = useGetTagsWithCategoryByAccountBookId({
      accountBookId: activeAccountBook!.id!,
    });

    const { data } = useGetFlowRecordListByAccountBookId({
      accountBookId: activeAccountBook!.id,
      filter: {
        tagId,
        categoryId,
        traderId,
        savingAccountId,
        startDealAt,
        endDealAt,
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

    const [uploadFlowRecord] = useUpdateFlowRecord();

    const [deleteFlowRecord] = useDeleteFlowRecord();

    const tags = useMemo(() => tagsData?.data || [], [tagsData]);

    const users = useMemo(() => {
      const { members, admins } = activeAccountBook!;
      return [...admins, ...members];
    }, [activeAccountBook]);

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
              <Tag color={CategoryTypeInfoMap[value.category.type].color}>
                {value.name}
              </Tag>
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

    return (
      <Table
        data={data?.data || []}
        columns={columns}
        editable={true}
        onEditSubmit={handleEditSubmit}
        pagination={data && getPagination(data.total)}
      />
    );
  },
);

export default FlowRecordTable;
