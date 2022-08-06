import { Select } from 'antd';
import { FC, useCallback, useRef, useState } from 'react';
import { searchUsers } from '../../api';

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

const UserSelect: FC<UserSelectProps> = ({ limit = 10, value, onChange }) => {
  const [options, setOptions] = useState<Array<ValueType>>([]);

  const fetchRef = useRef(0);

  const handleSearch = useCallback(
    async (value: string) => {
      fetchRef.current++;
      const fetchId = fetchRef.current;
      setOptions([]);
      const users = await searchUsers(value, limit);
      if (fetchRef.current === fetchId) {
        console.log(1);
        setOptions(
          users.map((it) => ({
            key: it.id + '',
            label: it.username,
            value: it.id,
          })),
        );
      }
    },
    [limit],
  );

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
