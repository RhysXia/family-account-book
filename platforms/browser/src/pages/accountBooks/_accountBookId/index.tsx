import Content from '@/components/Content';
import { activeAccountBookAtom } from '@/store';
import { TagType } from '@/types';
import { useAtom } from 'jotai';
import AmountCard from './commons/AmountCard';

const AMOUNT_CARDS = [
  [TagType.EXPENDITURE, '支出'],
  [TagType.INCOME, '收入'],
  [TagType.INVESTMENT, '投资'],
  [TagType.LOAD, '借贷'],
] as const;

const Overview = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

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
      <div className="-m-4 bg-gray-100 flex items-center flex-wrap">
        {AMOUNT_CARDS.map((it, index) => (
          <div key={index} className="md:w-1/2 lg:w-1/4 px-2">
            <AmountCard title={it[1]} type={it[0]} />
          </div>
        ))}
      </div>
    </Content>
  );
};

export default Overview;
