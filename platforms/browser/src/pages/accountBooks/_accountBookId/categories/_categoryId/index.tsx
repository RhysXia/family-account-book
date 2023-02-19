import Content from '@/components/Content';
import DatePicker from '@/components/DatePicker';
import FlowRecordPie from '@/components/FlowRecordPie';
import FlowRecordTable from '@/components/FlowRecordTable';
import Title from '@/components/Title';
import { useGetCategoryById } from '@/graphql/category';
import { useGetFlowRecordTotalAmountPeTagByCategoryId } from '@/graphql/categoryStaticstics';
import { useGetTagsWithCategoryByAccountBookId } from '@/graphql/tag';
import { activeAccountBookAtom } from '@/store';
import { DateGroupBy } from '@/types';
import { CategoryTypeInfoMap } from '@/utils/constants';
import { Radio, RadioChangeEvent, Select, Spin, Switch, Tag } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import FlowRecordTrend from '../../commons/FlowRecordTrend';

const Catgeory = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const { categoryId } = useParams();

  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(() => {
    const now = dayjs();
    return [now.startOf('month'), null];
  });
  const [enableStack, setEnableStack] = useState(false);
  const [groupBy, setGroupBy] = useState<DateGroupBy>('DAY');
  const [traderIdFilter, setTraderIdFilter] = useState<string>();

  const [tagIdFilter, setTagIdFilter] = useState<string>();

  const { data: category } = useGetCategoryById({ id: categoryId! });

  const { data: tagData } = useGetTagsWithCategoryByAccountBookId({
    accountBookId: activeAccountBook!.id,
    filter: {
      categoryId,
    },
  });

  const { data } = useGetFlowRecordTotalAmountPeTagByCategoryId({
    categoryId: categoryId!,
    filter: {
      startDealAt: dateRange?.[0]?.toISOString(),
      endDealAt: dateRange?.[1]?.toISOString(),
      traderId: traderIdFilter,
    },
  });

  const users = useMemo(() => {
    const { members, admins } = activeAccountBook!;
    return [...admins, ...members];
  }, [activeAccountBook]);

  const handleGroupByChange = useCallback((e: RadioChangeEvent) => {
    setGroupBy(e.target.value);
  }, []);

  const breadcrumbs = [
    {
      name: activeAccountBook!.name,
      path: `/accountBooks/${activeAccountBook!.id}`,
    },
    {
      name: '分类列表',
      path: `/accountBooks/${activeAccountBook!.id}/categories`,
    },
    {
      name: category?.name || '',
    },
  ];

  if (!category) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spin />
      </div>
    );
  }

  return (
    <Content breadcrumbs={breadcrumbs} contentClassName="p-0">
      <div className="space-y-4 bg-gray-100">
        <Title
          extra={
            <>
              <Select
                style={{ minWidth: 200 }}
                allowClear={true}
                placeholder="请选择交易人员"
                value={traderIdFilter}
                onChange={setTraderIdFilter}
              >
                {users.map((it) => {
                  return (
                    <Select.Option value={it.id} key={it.id}>
                      <span className="flex items-center">{it.nickname}</span>
                    </Select.Option>
                  );
                })}
              </Select>
              <DatePicker.RangePicker
                allowEmpty={[false, true]}
                value={dateRange}
                onChange={setDateRange}
              />
            </>
          }
        >{`${category?.name}详细数据`}</Title>
        <div className="flex flex-wrap -mx-2">
          <div className="w-full sm:w-1/2 xxl:w-1/4 h-96 p-2">
            <FlowRecordPie
              className="bg-white rounded p-2"
              title={category?.name || ''}
              data={data?.map((it) => ({
                value: it.amount,
                name: it.tag.name,
              }))}
            />
          </div>
          <div className="w-full sm:w-1/2 xxl:w-1/4 h-96 p-2">
            <div className="bg-white flex flex-col rounded w-full h-full p-2">
              <div className="flex items-center justify-end flex-wrap space-x-2 ">
                <Radio.Group value={groupBy} onChange={handleGroupByChange}>
                  <Radio.Button value="DAY">按日</Radio.Button>
                  <Radio.Button value="MONTH">按月</Radio.Button>
                  <Radio.Button value="YEAR">按年</Radio.Button>
                </Radio.Group>
                <div className="flex items-center">
                  <span className="pr-2">开启累计视图</span>
                  <Switch checked={enableStack} onChange={setEnableStack} />
                </div>
              </div>
              <div className="flex-1 pt-4">
                <FlowRecordTrend
                  traderId={traderIdFilter}
                  enableStack={enableStack}
                  dateRange={dateRange}
                  groupBy={groupBy}
                  category={category}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-2 space-y-2">
          <div className="flex justify-end items-center">
            <Select
              style={{ minWidth: 200 }}
              allowClear={true}
              placeholder="请选择标签"
              value={tagIdFilter}
              onChange={setTagIdFilter}
            >
              {(tagData?.data || []).map((it) => {
                return (
                  <Select.Option value={it.id} key={it.id}>
                    <Tag color={CategoryTypeInfoMap[it.category.type].color}>
                      {it.name}
                    </Tag>
                  </Select.Option>
                );
              })}
            </Select>
          </div>
          <div className="overflow-x-auto">
            <FlowRecordTable
              tagId={tagIdFilter}
              categoryId={categoryId}
              traderId={traderIdFilter}
              startDealAt={dateRange?.[0]?.format('YYYY-MM-DD')}
              endDealAt={dateRange?.[1]?.format('YYYY-MM-DD')}
            />
          </div>
        </div>
      </div>
    </Content>
  );
};

export default Catgeory;
