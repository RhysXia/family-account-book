import Content from '@/components/Content';
import DatePicker from '@/components/DatePicker';
import { useGetCategoryListByAccountBookId } from '@/graphql/category';
import useConstantFn from '@/hooks/useConstanFn';
import { activeAccountBookAtom } from '@/store';
import { CategoryType, DateGroupBy } from '@/types';
import { Radio, RadioChangeEvent, Tabs } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import AmountCard from './commons/AmountCard';
import FlowRecordTrend from './commons/FlowRecordTrend';

const Overview = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [groupBy, setGroupBy] = useState<DateGroupBy>('DAY');

  const [manualDateChange, setManualDateChange] = useState(false);

  const { data: categoriesData } = useGetCategoryListByAccountBookId({
    accountBookId: activeAccountBook!.id,
    pagination: {
      orderBy: [
        {
          field: 'order',
          direction: 'DESC',
        },
        {
          field: 'createdAt',
          direction: 'DESC',
        },
      ],
    },
  });

  const [activeCategoryType, setActiveCategoryType] = useState<CategoryType>();

  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(() => {
    const now = dayjs();
    return [now.startOf('month'), null];
  });

  const handleDateChange = useCallback(
    (v: [Dayjs | null, Dayjs | null] | null) => {
      setManualDateChange(true);
      setDateRange(v);
    },
    [],
  );

  const changeDateRangeOnGroupBy = useConstantFn((groupByProp: DateGroupBy) => {
    if (manualDateChange) {
      return;
    }
    const now = dayjs();
    switch (groupByProp) {
      case 'DAY': {
        setDateRange([now.startOf('month'), null]);
        break;
      }
      case 'MONTH': {
        setDateRange([now.startOf('year'), null]);
        break;
      }
      case 'YEAR': {
        setDateRange([null, null]);
        break;
      }
    }
  });

  useEffect(() => {
    changeDateRangeOnGroupBy(groupBy);
  }, [groupBy, changeDateRangeOnGroupBy]);

  const handleGroupByChange = useCallback((e: RadioChangeEvent) => {
    setGroupBy(e.target.value);
  }, []);

  const breadcrumbs = [
    {
      name: activeAccountBook!.name,
      path: `/accountBooks/${activeAccountBook!.id}`,
    },
    {
      name: '首页',
    },
  ];

  return (
    <Content breadcrumbs={breadcrumbs}>
      <div className="-m-2 -mt-12 space-y-4 bg-gray-100">
        <div className="flex items-center justify-end sticky top-8 z-50">
          <div className="space-x-4 bg-white p-2 drop-shadow-lg">
            <Radio.Group value={groupBy} onChange={handleGroupByChange}>
              <Radio.Button value="DAY">按日</Radio.Button>
              <Radio.Button value="MONTH">按月</Radio.Button>
              <Radio.Button value="YEAR">按年</Radio.Button>
            </Radio.Group>
            <DatePicker.RangePicker
              allowEmpty={[false, true]}
              value={dateRange}
              onChange={handleDateChange}
            />
          </div>
        </div>

        <div className="-m-2 -mb-0 flex items-center flex-wrap">
          <div className="md:w-1/2 lg:w-1/4 p-2">
            <AmountCard dateRange={dateRange} />
          </div>
          {categoriesData?.data.map((it) => (
            <div key={it.id} className="md:w-1/2 lg:w-1/4 p-2">
              <AmountCard category={it} dateRange={dateRange} />
            </div>
          ))}
        </div>
        <div className="bg-white rounded px-4">
          <Tabs
            activeKey={activeCategoryType}
            onChange={setActiveCategoryType as any}
            destroyInactiveTabPane={true}
          >
            <Tabs.TabPane tab="净收入">
              <FlowRecordTrend dateRange={dateRange} groupBy={groupBy} />
            </Tabs.TabPane>

            {categoriesData?.data.map((it) => (
              <Tabs.TabPane tab={it.name} key={it.id}>
                <FlowRecordTrend
                  dateRange={dateRange}
                  groupBy={groupBy}
                  category={it}
                />
              </Tabs.TabPane>
            ))}
          </Tabs>
        </div>
      </div>
    </Content>
  );
};

export default Overview;
