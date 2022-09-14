import { CategoryType } from '../types';

export const CategoryTypeInfoMap = {
  [CategoryType.NEGATIVE_AMOUNT]: {
    text: '收入',
    color: '#FCA5A5',
  },
  [CategoryType.POSITIVE_AMOUNT]: {
    text: '支出',
    color: '#6EE7B7',
  },
  [CategoryType.POSITIVE_OR_NEGATIVE_AMOUNT]: {
    text: '收入或支出',
    color: '#93C5FD',
  },
};

export const CategoryTypes = Object.keys(
  CategoryTypeInfoMap,
) as Array<CategoryType>;
