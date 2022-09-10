import Content from '@/components/Content';
import { activeAccountBookAtom } from '@/store';
import { useAtom } from 'jotai';

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
    <Content title="首页" breadcrumbs={breadcrumbs}>
      overview
    </Content>
  );
};

export default Overview;
