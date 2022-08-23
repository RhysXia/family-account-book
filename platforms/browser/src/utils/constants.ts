import { TagType } from '../types';

export const TagColorMap = {
  [TagType.INCOME]: {
    text: '收入',
    color: 'green',
  },
  [TagType.EXPENDITURE]: {
    text: '支出',
    color: 'red',
  },
  [TagType.LOAD]: {
    text: '借贷',
    color: 'blue',
  },
  [TagType.INVESTMENT]: {
    text: '投资',
    color: 'purple',
  },
};
