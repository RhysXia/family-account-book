import { activeAccountBookAtom } from '@/store';
import { useAtom } from 'jotai';
import { FC, useMemo } from 'react';
import { TagType } from '@/types';
import dayjs from 'dayjs';
import useGetFlowRecordAmount from '@/graphql/useGetFlowRecordAmount';
import IndicatorCard from '@/components/IndicatorCard';
import Indicator from '@/components/Indicator';

export type AmountCardProps = {
  type: TagType;
  title: string;
};

const AmountCard: FC<AmountCardProps> = ({ type, title }) => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const dates = useMemo(() => {
    const day = dayjs();
    const lastMonth = day.add(-1, 'month');
    return [
      day.startOf('month').toISOString(),
      lastMonth.startOf('month').toISOString(),
      lastMonth.endOf('month').toISOString(),
    ];
  }, []);

  const { data: currentMonthData } = useGetFlowRecordAmount({
    accountBookId: activeAccountBook!.id,
    tagType: type,
    startDate: dates[0],
  });

  const { data: lastMonthData } = useGetFlowRecordAmount({
    accountBookId: activeAccountBook!.id,
    tagType: type,
    startDate: dates[1],
    endDate: dates[2],
  });

  const currentMonthAmount = Math.abs(
    currentMonthData?.node.flowRecordAmount || 0,
  );

  const lastMonthAmount = Math.abs(lastMonthData?.node.flowRecordAmount || 0);

  const users = [...activeAccountBook!.admins, ...activeAccountBook!.members];

  const userDetails = (
    <div className="flex items-center space-x-2 w-full overflow-auto">
      {users.map((it) => (
        <UserFlowRecord
          key={it.id}
          user={it}
          type={type}
          startDate={dates[0]}
        />
      ))}
    </div>
  );

  return (
    <IndicatorCard
      title={title}
      tips={`月度${title}统计`}
      value={`￥ ${currentMonthAmount.toLocaleString()}`}
      footer={userDetails}
    >
      <Indicator
        title="同比上月"
        value={
          lastMonthAmount
            ? (currentMonthAmount - lastMonthAmount) / lastMonthAmount
            : undefined
        }
      />
    </IndicatorCard>
  );
};

export default AmountCard;

type UserFlowRecordProps = {
  type: TagType;
  user: {
    id: string;
    nickname: string;
  };
  startDate: string;
};

const UserFlowRecord: FC<UserFlowRecordProps> = ({ user, startDate, type }) => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);
  const { data: currentMonthData } = useGetFlowRecordAmount({
    accountBookId: activeAccountBook!.id,
    tagType: type,
    startDate,
    traderId: user.id,
  });

  const currentMonthAmount = Math.abs(
    currentMonthData?.node.flowRecordAmount || 0,
  );

  return (
    <div>
      {user.nickname}: ￥ {currentMonthAmount.toLocaleString()}
    </div>
  );
};
