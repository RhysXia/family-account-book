import dayjs, { Dayjs } from 'dayjs';
import dayjsGenerateConfig from 'rc-picker/es/generate/dayjs';
import generatePicker from 'antd/es/date-picker/generatePicker';
import locale_zh from 'dayjs/locale/zh-cn';

dayjs.locale(locale_zh);

const DatePicker = generatePicker<Dayjs>(dayjsGenerateConfig);

export default DatePicker;
