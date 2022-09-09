import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

dayjs.extend(relativeTime);

export const fromTime = (
  time: dayjs.ConfigType,
  from: dayjs.ConfigType = dayjs(),
  duration: number = 1000 * 60 * 60 * 24 * 7,
) => {
  const day = dayjs(time);
  const fromDay = dayjs(from);

  if (fromDay.valueOf() - duration < day.valueOf()) {
    return day.from(fromDay);
  }
  return day.format('YYYY-MM-DD');
};
