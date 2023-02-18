import { ItemType } from 'antd/lib/menu/hooks/useItems';
import {
  AppstoreOutlined,
  InboxOutlined,
  // ShopOutlined,
  CreditCardOutlined,
  TagsOutlined,
  // DollarCircleOutlined,
  LineChartOutlined,
  EditOutlined,
} from '@ant-design/icons';

const items: Array<ItemType> = [
  {
    label: '总览',
    key: '',
    icon: <AppstoreOutlined />,
  },
  {
    label: '流水管理',
    key: 'flowRecords',
    icon: <EditOutlined />,
  },
  // {
  //   label: '支出',
  //   key: 'expenditure-group',
  //   icon: <ShopOutlined />,
  //   children: [
  //     {
  //       label: '列表',
  //       key: 'expenditures',
  //     },
  //     {
  //       label: '统计',
  //       key: 'expenditures/statistics',
  //     },
  //   ],
  // },
  // {
  //   label: '预算管理',
  //   key: 'budget-group',
  //   icon: <LineChartOutlined />,
  //   children: [
  //     {
  //       label: '列表',
  //       key: 'budgets',
  //     },
  //     // {
  //     //   label: '支出详情',
  //     //   key: 'expand-detail',
  //     // },
  //   ],
  // },
  // {
  //   label: '收入管理',
  //   key: 'income-group',
  //   icon: <DollarCircleOutlined />,
  //   children: [
  //     {
  //       label: '列表',
  //       key: 'incomes',
  //     },
  //     {
  //       label: '统计',
  //       key: 'incomes/statistics',
  //     },
  //   ],
  // },
  {
    label: '账户管理',
    key: 'savingAccount-group',
    icon: <CreditCardOutlined />,
    children: [
      {
        label: '列表',
        key: 'savingAccounts',
      },
      {
        label: '统计',
        key: 'savingAccounts/statistics',
      },
    ],
  },
  {
    label: '分类管理',
    key: 'category-group',
    icon: <InboxOutlined />,
    children: [
      {
        label: '列表',
        key: 'categories',
      },
      {
        label: '统计',
        key: 'categories/statistics',
      },
    ],
  },
  {
    label: '标签管理',
    key: 'tag-group',
    icon: <TagsOutlined />,
    children: [
      {
        label: '列表',
        key: 'tags',
      },
      {
        label: '统计',
        key: 'tags/statistics',
      },
    ],
  },
];

export default items;
