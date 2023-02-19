import { activeAccountBookAtom } from '@/store';
import { useAtom } from 'jotai';
import { FC } from 'react';
import { Dayjs } from 'dayjs';
import { CategoryType } from '@/types';
import { useGetFlowRecordTotalAmountPerCategoryByAccountBookId } from '@/graphql/accountBookStatistics';
import Card from '@/components/Card';
import { CategoryTypeInfoMap } from '@/utils/constants';
import { default as InnerFlowRecordPie } from '@/components/FlowRecordPie';

export type AmountCardProps = {
  categoryType: CategoryType;
  dateRange?: [Dayjs | null, Dayjs | null] | null;
};

const FlowRecordPie: FC<AmountCardProps> = ({ categoryType, dateRange }) => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const { data } = useGetFlowRecordTotalAmountPerCategoryByAccountBookId({
    accountBookId: activeAccountBook!.id,
    filter: {
      categoryType,
      startDealAt: dateRange?.[0]?.toISOString(),
      endDealAt: dateRange?.[1]?.toISOString(),
    },
  });

  return (
    <Card
      className="w-full h-full"
      title={CategoryTypeInfoMap[categoryType].text}
    >
      <InnerFlowRecordPie
        title={CategoryTypeInfoMap[categoryType].text}
        data={(data || []).map((it) => ({
          value: Math.abs(it.amount),
          name: it.category.name,
        }))}
      />
    </Card>
  );
};

export default FlowRecordPie;
