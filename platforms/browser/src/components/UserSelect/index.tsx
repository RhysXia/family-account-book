import { gql, useLazyQuery } from '@apollo/client';
import { Select, SelectProps } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { User } from '../../types';

export type ValueType = {
  key?: string;
  label: React.ReactNode;
  value: any;
};

export type UserSelectProps = SelectProps & {
  limit?: number;
  value?: ValueType | Array<ValueType>;
  onChange?: (value: ValueType | Array<ValueType>) => void;
  className?: string;
  multiple?: boolean;
  includeSelf?: boolean;
};

const GET_USER_LIST = gql`
  query findUserListByNameLike(
    $name: String!
    $limit: Int!
    $includeSelf: Boolean
  ) {
    findUserListByNameLike(
      name: $name
      limit: $limit
      includeSelf: $includeSelf
    ) {
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

const UserSelect: FC<UserSelectProps> = ({
  limit = 10,
  value,
  onChange,
  multiple,
  includeSelf,
  ...others
}) => {
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
          includeSelf,
        },
      });
      if (fetchRef.current === fetchId) {
        const users =
          data?.findUserListByNameLike?.map((it) => ({
            key: it.id + '',
            label: it.nickname,
            value: it.id,
          })) || [];
        setOptions(users);
      }
    },
    [limit, searchUsers, includeSelf],
  );

  useEffect(() => {
    handleSearch('');
  }, [handleSearch]);

  return (
    <Select
      {...others}
      mode={multiple ? 'multiple' : undefined}
      value={value}
      onChange={onChange}
      labelInValue={true}
      filterOption={false}
      options={options}
      onSearch={handleSearch}
      showSearch={true}
    ></Select>
  );
};

export default UserSelect;
