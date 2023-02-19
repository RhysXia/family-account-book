import { activeAccountBookAtom } from '@/store';
import { useAtom } from 'jotai';
import { FC } from 'react';
import { Dayjs } from 'dayjs';
import { CategoryType } from '@/types';
import { useGetFlowRecordTotalAmountPerCategoryByAccountBookId } from '@/graphql/accountBookStatistics';
import Card from '@/components/Card';
import { CategoryTypeInfoMap } from '@/utils/constants';
import { default as InnerFlowRecordPie } from '@/components/FlowRecordPie';
import useConstantFn from '@/hooks/useConstanFn';
import * as echarts from 'echarts/core';
import { useNavigate } from 'react-router-dom';

export type AmountCardProps = {
  categoryType: CategoryType;
  dateRange?: [Dayjs | null, Dayjs | null] | null;
};

const FlowRecordPie: FC<AmountCardProps> = ({ categoryType, dateRange }) => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);
  const navigate = useNavigate();

  const { data } = useGetFlowRecordTotalAmountPerCategoryByAccountBookId({
    accountBookId: activeAccountBook!.id,
    filter: {
      categoryType,
      startDealAt: dateRange?.[0]?.toISOString(),
      endDealAt: dateRange?.[1]?.toISOString(),
    },
  });

  const instanceInterceptor = useConstantFn<
    (instance: echarts.ECharts) => () => void
  >((instance) => {
    const cb = ({ data: { id } }: any) => {
      navigate(`/accountBooks/${activeAccountBook!.id}/categories/${id}`);
    };
    instance.on('click', 'series', cb);

    return () => {
      instance.off('click', cb);
    };
  });

  return (
    <Card
      className="w-full h-full"
      title={CategoryTypeInfoMap[categoryType].text}
    >
      <InnerFlowRecordPie
        instanceInterceptor={instanceInterceptor}
        title={CategoryTypeInfoMap[categoryType].text}
        data={(data || []).map((it) => ({
          id: it.category.id,
          value: Math.abs(it.amount),
          name: it.category.name,
        }))}
      />
    </Card>
  );
};

export default FlowRecordPie;
