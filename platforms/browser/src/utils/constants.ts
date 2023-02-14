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

export const COLORS = [
  ['rgb(255, 191, 0)', 'rgb(224, 62, 76)'],
  ['rgb(255, 0, 135)', 'rgb(135, 0, 157)'],
  ['rgb(55, 162, 255)', 'rgb(116, 21, 219)'],
  ['rgb(0, 221, 255)', 'rgb(77, 119, 255)'],
  ['rgb(128, 255, 165)', 'rgb(1, 191, 236)'],
];
