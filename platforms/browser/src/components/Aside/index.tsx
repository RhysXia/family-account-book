import { Menu } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useAtom } from 'jotai';
import {
  AppstoreOutlined,
  ShopOutlined,
  CreditCardOutlined,
  TagsOutlined,
  DollarCircleOutlined,
  LineChartOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { activeAccountBookAtom } from '../../store';

const items: Array<ItemType> = [
  {
    label: '总览',
    key: '',
    icon: <AppstoreOutlined />,
  },
  {
    label: '流水记录',
    key: 'flowRecords',
    icon: <EditOutlined />,
  },
  {
    label: '支出',
    key: 'expenditure-group',
    icon: <ShopOutlined />,
    children: [
      {
        label: '列表',
        key: 'expenditures',
      },
      {
        label: '统计',
        key: 'expenditures/statistics',
      },
    ],
  },
  {
    label: '预算',
    key: 'budget-group',
    icon: <LineChartOutlined />,
    children: [
      {
        label: '列表',
        key: 'budgets',
      },
      // {
      //   label: '支出详情',
      //   key: 'expand-detail',
      // },
    ],
  },
  {
    label: '收入',
    key: 'income-group',
    icon: <DollarCircleOutlined />,
    children: [
      {
        label: '列表',
        key: 'incomes',
      },
      {
        label: '统计',
        key: 'incomes/statistics',
      },
    ],
  },
  {
    label: '储蓄',
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
    label: '标签',
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

const Aside = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const { pathname } = useLocation();

  const navigate = useNavigate();

  const handleSelect = useCallback(
    (value: { key: string }) => {
      navigate(value.key);
    },
    [navigate],
  );

  const selectKey = pathname.replace(/\/accountBooks\/\d+\/?/, '');

  return (
    <div className="min-h-full w-60 bg-white text-white flex flex-col">
      <div className="px-6 py-2 flex flex-col">
        <h1 className="text-black font-bold text-xl leading-none">
          <span>{activeAccountBook?.name}</span>
        </h1>
        <div className="text-gray-600 text-sm text-ellipsis">
          {activeAccountBook?.desc || ' '}
        </div>
      </div>
      <Menu
        onSelect={handleSelect}
        className="flex-1 w-full border-r-0"
        defaultSelectedKeys={[selectKey]}
        mode="inline"
        items={items}
      />
    </div>
  );
};

export default Aside;
