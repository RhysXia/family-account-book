import Content from '@/components/Content';
import { activeAccountBookAtom } from '@/store';
import { DateGroupBy, TagType } from '@/types';
import { useAtom } from 'jotai';
import { useState } from 'react';
import AmountCard from './commons/AmountCard';
import FlowRecordTrend from './commons/FlowRecordTrend';

const AMOUNT_CARDS = [
  [TagType.EXPENDITURE, '支出'],
  [TagType.INCOME, '收入'],
  [TagType.INVESTMENT, '投资'],
  [TagType.LOAD, '借贷'],
] as const;

const Overview = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [groupBy, setGroupBy] = useState<DateGroupBy>('DAY');
  const [tagType, setTagType] = useState<TagType>(TagType.EXPENDITURE);

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
      <div className="-m-4 space-y-2 bg-gray-100">
        <div className="flex items-center flex-wrap">
          {AMOUNT_CARDS.map((it, index) => (
            <div key={index} className="md:w-1/2 lg:w-1/4 px-2">
              <AmountCard title={it[1]} type={it[0]} />
            </div>
          ))}
        </div>
        <div>
          <FlowRecordTrend groupBy={groupBy} tagType={tagType} />
        </div>
      </div>
    </Content>
  );
};

export default Overview;
