import Logo from './logo.svg';
import { Avatar, Dropdown, Menu, Input, Select } from 'antd';
import { useAtom } from 'jotai';
import { currentUser } from '../../store/user';
import clsx from 'clsx';
import { Link, useLocation, useRoutes, matchPath } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { AccountBook } from '../../types/accountBook';

const { Option } = Select;

const navigation = [
  {
    name: '创建账本',
    href: '/account/create',
  },
];

const getAcountBooks = gql`
  {
    accountBooks {
      id
      name
    }
  }
`;

const Header = () => {
  const [user] = useAtom(currentUser);

  const { data } = useQuery<{ accountBooks: Array<AccountBook> }>(
    getAcountBooks,
  );

  const accountBooks = data?.accountBooks || [];

  const { pathname } = useLocation();

  const overlay = (
    <Menu
      className="w-36 rounded"
      items={[
        {
          key: 1,
          label: '注销',
        },
      ]}
    />
  );

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto px-2 max-w-full">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-start">
            <div className="flex-shrink-0 flex items-center">
              <img src={Logo} alt="logo" className="h-8 w-auto" />
            </div>
            <div className="block ml-6">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      matchPath(item.href, pathname)
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'px-3 py-2 rounded-md text-sm font-medium',
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Select className="w-32" placeholder="请选择账本">
              {accountBooks.map((it) => (
                <Option value={it.id}>{it.name}</Option>
              ))}
            </Select>
          </div>
          <div>
            <Dropdown overlay={overlay}>
              <Avatar className="bg-indigo-500 cursor-pointer">
                {user?.nickname}
              </Avatar>
            </Dropdown>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
