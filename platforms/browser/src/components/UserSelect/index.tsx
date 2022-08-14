import { gql, useLazyQuery, useQuery } from '@apollo/client';
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
  query ($username: String!, $limit: Int!) {
    findUserListByUsernameLike(username: $username, limit: $limit) {
      id
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
    findUserListByUsernameLike: Array<User>;
  }>(GET_USER_LIST);

  const fetchRef = useRef(0);

  const handleSearch = useCallback(
    async (username: string) => {
      fetchRef.current++;
      const fetchId = fetchRef.current;
      setOptions([]);
      const { data } = await searchUsers({
        variables: {
          username,
          limit,
        },
      });
      if (fetchRef.current === fetchId) {
        const users =
          data?.findUserListByUsernameLike?.map((it) => ({
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
