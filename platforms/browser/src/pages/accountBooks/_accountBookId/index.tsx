import Content from '@/components/Content';
import { activeAccountBookAtom } from '@/store';
import { TagType } from '@/types';
import { useAtom } from 'jotai';
import ExpenditureCard from './commons/ExpenditureCard';

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
      <div className="flex items-center space-x-4">
        <ExpenditureCard title="总支出" tagType={TagType.EXPENDITURE} />
      </div>
    </Content>
  );
};

export default Overview;
