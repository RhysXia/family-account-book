import { TagType } from '../types';

export const TagInfoMap = {
  [TagType.EXPENDITURE]: {
    text: '支出',
    color: '#FCA5A5',
  },
  [TagType.INCOME]: {
    text: '收入',
    color: '#6EE7B7',
  },
  [TagType.INVESTMENT]: {
    text: '投资',
    color: '#93C5FD',
  },
  [TagType.LOAD]: {
    text: '借贷',
    color: '#F9A8D4',
  },
};
