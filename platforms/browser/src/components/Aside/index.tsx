import menus from '@/menus';
import { Menu } from 'antd';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { activeAccountBookAtom } from '../../store';

const Aside = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const navigate = useNavigate();

  const { pathname } = useLocation();

  const selectKey = pathname.replace(/\/accountBooks\/[\w\d=]+\/?/, '');

  const handleSelect = useCallback(
    (value: { key: string }) => {
      navigate(value.key);
    },
    [navigate],
  );

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
        items={menus}
      />
    </div>
  );
};

export default Aside;
