import Content from '@/components/Content';
import DatePicker from '@/components/DatePicker';
import { activeAccountBookAtom } from '@/store';
import { DateGroupBy, TagType } from '@/types';
import { TagInfoMap } from '@/utils/constants';
import { Radio, RadioChangeEvent, Tabs } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { useCallback, useState } from 'react';
import AmountCard from './commons/AmountCard';
import FlowRecordTrend from './commons/FlowRecordTrend';

const keys = Object.keys(TagInfoMap) as Array<TagType>;

const Overview = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [groupBy, setGroupBy] = useState<DateGroupBy>('DAY');
  const [tagType, setTagType] = useState<TagType>(keys[0]);
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(() => {
    const now = dayjs();
    return [now.startOf('month'), null];
  });

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
      <div className="-m-2 space-y-4 bg-gray-100">
        <div className="-m-2 -mb-0 flex items-center flex-wrap">
          {keys.map((key) => (
            <div key={key} className="md:w-1/2 lg:w-1/4 px-2">
              <AmountCard title={TagInfoMap[key].text} type={key} />
            </div>
          ))}
        </div>
        <div className="bg-white rounded px-2">
          <Tabs
            activeKey={tagType}
            onChange={setTagType as any}
            tabBarExtraContent={
              <div className="space-x-4">
                <Radio.Group value={groupBy} onChange={handleGroupByChange}>
                  <Radio.Button value="DAY">按日</Radio.Button>
                  <Radio.Button value="MONTH">按月</Radio.Button>
                  <Radio.Button value="YEAR">按年</Radio.Button>
                </Radio.Group>
                <DatePicker.RangePicker
                  allowEmpty={[false, true]}
                  value={dateRange}
                  onChange={setDateRange}
                />
              </div>
            }
          >
            {keys.map((key) => (
              <Tabs.TabPane tab={TagInfoMap[key].text} key={key}>
                <FlowRecordTrend
                  dateRange={dateRange}
                  groupBy={groupBy}
                  tagType={key}
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
