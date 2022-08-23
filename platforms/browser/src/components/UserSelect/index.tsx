import { gql, useLazyQuery } from '@apollo/client';
import { Select } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { User } from '../../types';

export type ValueType = {
  key?: string;
  label: React.ReactNode;
  value: string | number;
};

export type UserSelectProps = {
  limit?: number;
  value?: Array<ValueType>;
  onChange?: (value: Array<ValueType>) => void;
};

const GET_USER_LIST = gql`
  query findUserListByNameLike($name: String!, $limit: Int!) {
    findUserListByNameLike(name: $name, limit: $limit) {
      id
      nickname
      username
      email
      avatar
      createdAt
      updatedAt
    }
  }
`;

const UserSelect: FC<UserSelectProps> = ({ limit = 10, value, onChange }) => {
  const [options, setOptions] = useState<Array<ValueType>>([]);

  const [searchUsers] = useLazyQuery<{
    findUserListByNameLike: Array<User>;
  }>(GET_USER_LIST);

  const fetchRef = useRef(0);

  const handleSearch = useCallback(
    async (name: string) => {
      fetchRef.current++;
      const fetchId = fetchRef.current;
      setOptions([]);
      const { data } = await searchUsers({
        variables: {
          name,
          limit,
        },
      });
      if (fetchRef.current === fetchId) {
        const users =
          data?.findUserListByNameLike?.map((it) => ({
            key: it.id + '',
            label: it.username,
            value: it.id,
          })) || [];
        setOptions(users);
      }
    },
    [limit, searchUsers],
  );

  useEffect(() => {
    handleSearch('');
  }, [handleSearch]);

  return (
    <Select
      mode="multiple"
      value={value}
      onChange={onChange}
      labelInValue
      filterOption={false}
      options={options}
      onSearch={handleSearch}
      showSearch={true}
    ></Select>
  );
};

export default UserSelect;
