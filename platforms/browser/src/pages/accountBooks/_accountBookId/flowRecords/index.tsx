import Content from '@/components/Content';
import DatePicker from '@/components/DatePicker';
import FlowRecordTable, {
  FlowRecordTableRef,
} from '@/components/FlowRecordTable';
import { useGetSavingAccountListByAccountBookId } from '@/graphql/savingAccount';
import { useGetTagsWithCategoryByAccountBookId } from '@/graphql/tag';
import { activeAccountBookAtom } from '@/store';
import { Category } from '@/types';
import { CategoryTypeInfoMap } from '@/utils/constants';
import { CreditCardOutlined } from '@ant-design/icons';
import { Button, Select, Tag } from 'antd';
import { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { useCallback, useMemo, useRef, useState } from 'react';
import CreateModel from './commons/CreateModel';

const Index = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [modalVisible, setModalVisible] = useState(false);

  const tableRef = useRef<FlowRecordTableRef>(null);

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

  const [tagIdFilter, setTagIdFilter] = useState<string>();
  const [traderIdFilter, setTraderIdFilter] = useState<string>();
  const [savingAccountIdFilter, setSavingAccountIdFilter] = useState<string>();
  const [dealAtRange, setDealAtRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >();

  const [categoryIdFilter, setCategoryIdFilter] = useState<string>();

  const handleChange = useCallback((fn: (any) => void) => {
    return (args: any) => {
      fn(args);
      tableRef.current?.setPage(1);
    };
  }, []);

  const categories = useMemo(() => {
    const map = new Map<string, Category>();

    tags.forEach((t) => {
      const c = t.category;
      map.set(c.id, c);
    });

    return Array.from(map.values());
  }, [tags]);

  const savingAccounts = useMemo(
    () => accountBookWithSavingAccounts?.data || [],
    [accountBookWithSavingAccounts],
  );

  const handleCreate = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleRefreshSavingAccounts = useCallback(async () => {
    await refetchSavingAccounts();
  }, [refetchSavingAccounts]);

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
    >
      <div className="space-y-2">
        <div className="flex flex-wrap -m-2 justify-end">
          <Select
            className="m-2"
            allowClear={true}
            value={categoryIdFilter}
            onChange={handleChange(setCategoryIdFilter)}
            placeholder="请选择分类"
            style={{ minWidth: 200 }}
          >
            {categories.map((c) => (
              <Select.Option value={c.id} key={c.id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            className="m-2"
            allowClear={true}
            value={tagIdFilter}
            disabled={!categoryIdFilter}
            onChange={handleChange(setTagIdFilter)}
            placeholder="请选择标签"
            style={{ minWidth: 200 }}
          >
            {tags
              .filter((it) => it.category.id === categoryIdFilter)
              .map((it) => (
                <Select.Option value={it.id} key={it.id}>
                  <Tag color={CategoryTypeInfoMap[it.category.type].color}>
                    {it.name}
                  </Tag>
                </Select.Option>
              ))}
          </Select>
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
          <DatePicker.RangePicker
            className="m-2"
            placeholder={['交易开始日期', '交易结束时间']}
            value={dealAtRange}
            onChange={handleChange(setDealAtRange)}
            allowEmpty={[true, true]}
          />
        </div>
        <FlowRecordTable
          ref={tableRef}
          categoryId={categoryIdFilter}
          tagId={tagIdFilter}
          traderId={traderIdFilter}
          savingAccountId={savingAccountIdFilter}
          startDealAt={dealAtRange?.[0]?.format('YYYY-MM-DD')}
          endDealAt={dealAtRange?.[1]?.format('YYYY-MM-DD')}
        />
      </div>
      <CreateModel
        tags={tags}
        users={users}
        onChange={setModalVisible}
        onRefreshSavingAccounts={handleRefreshSavingAccounts}
        visible={modalVisible}
        savingAccounts={savingAccounts}
      />
    </Content>
  );
};

export default Index;
