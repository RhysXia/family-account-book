import { CategoryType } from '../types';

export const CategoryTypeInfoMap = {
  [CategoryType.EXPENDITURE]: {
    text: '支出',
    color: '#cf1322',
  },
  [CategoryType.INCOME]: {
    text: '收入',
    color: '#3f8600',
  },
  [CategoryType.UNKNOWN]: {
    text: '其他',
    color: '#93C5FD',
  },
};

export const CategoryTypes = Object.keys(
  CategoryTypeInfoMap,
) as Array<CategoryType>;
