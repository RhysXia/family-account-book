import { Menu } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useAtom } from 'jotai';
import { activeAccountBook as activeAccountBookStore } from '../../store/accountBook';
import {
  AppstoreOutlined,
  ShopOutlined,
  CreditCardOutlined,
  TagsOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const items: Array<ItemType> = [
  {
    label: '总览',
    key: '',
    icon: <AppstoreOutlined />,
  },
  {
    label: '支出',
    key: 'expend',
    icon: <ShopOutlined />,
    children: [
      {
        label: '支出详情',
        key: 'expand-detail',
      },
      {
        label: '预算',
        key: 'expend-budget',
      },
    ],
  },
  {
    label: '收入',
    key: 'income',
    icon: <DollarCircleOutlined />,
  },
  {
    label: '储蓄',
    key: 'savings',
    icon: <CreditCardOutlined />,
  },
  {
    label: '标签',
    key: 'tags',
    icon: <TagsOutlined />,
  },
];

const Aside = () => {
  const [activeAccountBook1] = useAtom(activeAccountBookStore);

  const { pathname } = useLocation();

  const navigate = useNavigate();

  const handleSelect = useCallback(
    (value: { key: string }) => {
      navigate(value.key);
    },
    [navigate],
  );

  const selectKey = pathname.replace(/\/accountBook\/\d+\/?/, '');

  return (
    <div className="min-h-full w-60 bg-white border-r border-gray-100 flex flex-col">
      <div className="px-6 py-2">
        <h1 className="font-bold text-xl">{activeAccountBook1?.name}</h1>
        <div className="text-sm text-gray-500 text-ellipsis">
          {activeAccountBook1?.desc}
        </div>
      </div>
      <Menu
        onSelect={handleSelect}
        className="flex-1 w-full bg-inherit border-r-0"
        defaultSelectedKeys={[selectKey]}
        mode="inline"
        items={items}
      />
    </div>
  );
};

export default Aside;
