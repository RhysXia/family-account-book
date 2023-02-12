import { CategoryType } from '../types';

export const CategoryTypeInfoMap = {
  [CategoryType.EXPENDITURE]: {
    text: '支出',
    color: '#FCA5A5',
  },
  [CategoryType.INCOME]: {
    text: '收入',
    color: '#6EE7B7',
  },
  [CategoryType.UNKNOWN]: {
    text: '其他',
    color: '#93C5FD',
  },
};

export const CategoryTypes = Object.keys(
  CategoryTypeInfoMap,
) as Array<CategoryType>;
