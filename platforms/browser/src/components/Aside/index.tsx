import { Menu } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';

const items: Array<ItemType> = [
  {
    label: '首页',
    key: 'index',
  },
];

const Aside = () => {
  return (
    <div>
      <Menu
        theme="dark"
        className="min-h-full w-60"
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        mode="inline"
        items={items}
      />
    </div>
  );
};

export default Aside;
