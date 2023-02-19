import Logo from './logo.svg';
import { Avatar, Drawer, Dropdown, Menu } from 'antd';
import { useAtom } from 'jotai';
import { useLocation, useNavigate } from 'react-router-dom';
import { currentUserAtom } from '../../store';
import { MenuOutlined } from '@ant-design/icons';
import { useCallback, useState } from 'react';
import menus from '@/menus';

const Header = () => {
  const [currentUser] = useAtom(currentUserAtom);

  const navigate = useNavigate();

  const { pathname } = useLocation();

  const selectKey = pathname.replace(/^\/accountBooks\/[\w\d=]+\/?/, '');

  const [visible, setVisible] = useState(false);

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
      setVisible(false);
    },
    [navigate],
  );

  const oepnDrawer = useCallback(() => {
    setVisible(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto px-6 max-w-full">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-start">
            <div className="space-x-2 lg:hidden mr-2">
              <MenuOutlined
                onClick={oepnDrawer}
                className="text-white text-lg cursor-pointer flex items-center"
              />
              <Drawer
                closable={false}
                placement="left"
                onClose={closeDrawer}
                visible={visible}
                bodyStyle={{ padding: 0 }}
                contentWrapperStyle={{ width: '70%', maxWidth: 300 }}
                maskClosable={true}
              >
                <Menu
                  onSelect={handleSelect}
                  selectedKeys={[selectKey]}
                  mode="inline"
                  items={menus}
                />
              </Drawer>
            </div>
            <div className="flex-shrink-0 flex items-center">
              <img
                src={Logo}
                alt="logo"
                className="h-8 w-auto mr-2 hidden lg:block"
              />
              <h1 className="text-white font-bold text-xl leading-none m-0">
                FAC
              </h1>
            </div>
            <div className="block ml-6">
              <div className="flex space-x-4"></div>
            </div>
          </div>
          <div className="space-x-2">
            <Dropdown overlay={overlay}>
              <Avatar className="bg-indigo-500 cursor-pointer">
                {currentUser?.nickname}
              </Avatar>
            </Dropdown>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
