import Logo from './logo.svg';
import { Avatar, Dropdown, Menu, Popover } from 'antd';
import { useAtom } from 'jotai';
import { useLocation, useNavigate } from 'react-router-dom';
import { currentUserAtom } from '../../store';
import { MenuOutlined } from '@ant-design/icons';
import { useCallback } from 'react';
import menus from '@/menus';
import styles from './style.module.less';

const Header = () => {
  const [currentUser] = useAtom(currentUserAtom);

  const navigate = useNavigate();

  const { pathname } = useLocation();

  const selectKey = pathname.replace(/\/accountBooks\/[\w\d=]+\/?/, '');

  const overlay = (
    <Menu
      className="w-36 rounded"
      onClick={(info) => {
        switch (info.key) {
          case 'switch-account-book': {
            navigate('/');
            break;
          }
        }
      }}
      items={[
        {
          key: 'switch-account-book',
          label: '切换账本',
        },
        {
          key: 2,
          label: '注销',
        },
      ]}
    />
  );

  const handleSelect = useCallback(
    (value: { key: string }) => {
      navigate(value.key);
    },
    [navigate],
  );

  const menusNode = (
    <Menu
      onSelect={handleSelect}
      className=""
      defaultSelectedKeys={[selectKey]}
      mode="inline"
      items={menus}
      style={{ width: 256 }}
    />
  );

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto px-6 max-w-full">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-start">
            <div className="flex-shrink-0 flex items-center">
              <img src={Logo} alt="logo" className="h-8 w-auto mr-2" />
              <h1 className="text-white font-bold text-xl leading-none m-0 ">
                FAC
              </h1>
            </div>
            <div className="block ml-6">
              <div className="flex space-x-4"></div>
            </div>
          </div>
          <div className="space-x-2 lg:block hidden">
            <Dropdown overlay={overlay}>
              <Avatar className="bg-indigo-500 cursor-pointer">
                {currentUser?.nickname}
              </Avatar>
            </Dropdown>
          </div>
          <div className="space-x-2 lg:hidden">
            <Popover
              content={menusNode}
              showArrow={false}
              overlayClassName={styles.menus}
            >
              <MenuOutlined className="text-white text-lg cursor-pointer" />
            </Popover>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
