import Content from '@/components/Content';
import FlowRecordPie from '@/components/FlowRecordPie';
import { useGetFlowRecordTotalAmountByAccountBookId } from '@/graphql/accountBookStatistics';
import { useGetCategoryById } from '@/graphql/category';
import { activeAccountBookAtom } from '@/store';
import { useAtom } from 'jotai';
import { useParams } from 'react-router-dom';

const Catgeory = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const { categoryId } = useParams();

  const { data: category } = useGetCategoryById({ id: categoryId! });

  const { data } = useGetFlowRecordTotalAmountByAccountBookId({
    accountBookId: activeAccountBook!.id,
    filter: {
      categoryId,
    },
  });

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

  return (
    <Content title={category?.name} breadcrumbs={breadcrumbs}>
      <div>
        <FlowRecordPie data={da}/>
      </div>
    </Content>
  );
};

export default Catgeory;
