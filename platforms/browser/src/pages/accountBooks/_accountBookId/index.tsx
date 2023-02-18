import Content from '@/components/Content';
import DatePicker from '@/components/DatePicker';
import Title from '@/components/Title';
import { useGetCategoryListByAccountBookId } from '@/graphql/category';
import useConstantFn from '@/hooks/useConstanFn';
import { activeAccountBookAtom } from '@/store';
import { CategoryType, DateGroupBy } from '@/types';
import { DATE_GROUP_BY_MAP } from '@/utils/constants';
import { Radio, RadioChangeEvent, Switch, Tabs } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import AmountCard from './commons/AmountCard';
import FlowRecordPie from './commons/FlowRecordPie';
import FlowRecordTrend from './commons/FlowRecordTrend';

const Overview = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [amountGroupBy, setAmountGroupBy] = useState<DateGroupBy>('DAY');

  const [pieDateRange, setPieDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(() => {
    const now = dayjs();
    return [now.startOf('month'), null];
  });

  const [lineDateRange, setLineDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(() => {
    const now = dayjs();
    return [now.startOf('month'), null];
  });

  const [lineGroupBy, setLineGroupBy] = useState<DateGroupBy>('DAY');

  const [lineManualDateChange, setLineManualDateChange] = useState(false);

  const [enableStack, setEnableStack] = useState(false);

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

  const handleLineDateChange = useCallback(
    (v: [Dayjs | null, Dayjs | null] | null) => {
      setLineManualDateChange(true);
      setLineDateRange(v);
    },
    [],
  );

  const changeDateRangeOnGroupBy = useConstantFn((groupByProp: DateGroupBy) => {
    if (lineManualDateChange) {
      return;
    }
    const now = dayjs();
    switch (groupByProp) {
      case 'DAY': {
        setLineDateRange([now.startOf('month'), null]);
        break;
      }
      case 'MONTH': {
        setLineDateRange([now.startOf('year'), null]);
        break;
      }
      case 'YEAR': {
        setLineDateRange([null, null]);
        break;
      }
    }
  });

  useEffect(() => {
    changeDateRangeOnGroupBy(lineGroupBy);
  }, [lineGroupBy, changeDateRangeOnGroupBy]);

  const handleGroupByChange = useCallback((e: RadioChangeEvent) => {
    setLineGroupBy(e.target.value);
  }, []);

  const handleAmountGroupByChange = useCallback((e: RadioChangeEvent) => {
    setAmountGroupBy(e.target.value);
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
    <Content breadcrumbs={breadcrumbs} contentClassName="p-0">
      <div className="space-y-4 bg-gray-100">
        <Title
          extra={
            <Radio.Group
              value={amountGroupBy}
              onChange={handleAmountGroupByChange}
            >
              <Radio.Button value="DAY">按日</Radio.Button>
              <Radio.Button value="MONTH">按月</Radio.Button>
              <Radio.Button value="YEAR">按年</Radio.Button>
            </Radio.Group>
          }
        >
          当{DATE_GROUP_BY_MAP[amountGroupBy]}流水统计
        </Title>

        <div className="-m-2 -mb-0 flex items-center flex-wrap">
          <div className="w-full sm:w-1/2 xl:w-1/4 p-2">
            <AmountCard groupBy={amountGroupBy} />
          </div>
          {categoriesData?.data.map((it) => (
            <div key={it.id} className="w-full sm:w-1/2 xl:w-1/4 p-2">
              <AmountCard category={it} groupBy={amountGroupBy} />
            </div>
          ))}
        </div>

        <Title
          extra={
            <DatePicker.RangePicker
              allowEmpty={[false, true]}
              value={pieDateRange}
              onChange={setPieDateRange}
            />
          }
        >
          各项流水占比统计
        </Title>
        <div className="flex flex-row flex-wrap -m-2">
          <div className="w-full sm:w-1/2 xl:w-1/3 xxl:w-1/4 h-96 p-2">
            <FlowRecordPie
              categoryType={CategoryType.EXPENDITURE}
              dateRange={pieDateRange}
            />
          </div>
          <div className="w-full sm:w-1/2 xl:w-1/3 xxl:w-1/4 h-96 p-2">
            <FlowRecordPie
              categoryType={CategoryType.INCOME}
              dateRange={pieDateRange}
            />
          </div>
        </div>
        <Title
          extra={
            <>
              <DatePicker.RangePicker
                allowEmpty={[false, true]}
                value={lineDateRange}
                onChange={handleLineDateChange}
              />
              <Radio.Group value={lineGroupBy} onChange={handleGroupByChange}>
                <Radio.Button value="DAY">按日</Radio.Button>
                <Radio.Button value="MONTH">按月</Radio.Button>
                <Radio.Button value="YEAR">按年</Radio.Button>
              </Radio.Group>
              <div className="flex items-center">
                <span className="pr-2">开启累计视图</span>
                <Switch checked={enableStack} onChange={setEnableStack} />
              </div>
            </>
          }
        >
          各项流水详细信息统计
        </Title>
        <div className="bg-white rounded px-4">
          <Tabs
            activeKey={activeCategoryType}
            onChange={setActiveCategoryType as any}
            destroyInactiveTabPane={true}
          >
            <Tabs.TabPane tab="净收入">
              <FlowRecordTrend
                enableStack={enableStack}
                dateRange={lineDateRange}
                groupBy={lineGroupBy}
              />
            </Tabs.TabPane>

            {categoriesData?.data.map((it) => (
              <Tabs.TabPane tab={it.name} key={it.id}>
                <FlowRecordTrend
                  enableStack={enableStack}
                  dateRange={lineDateRange}
                  groupBy={lineGroupBy}
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
