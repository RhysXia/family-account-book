import { currentUserAtom } from '@/store';
import {
  FlowRecord,
  PaginationResult,
  SavingAccount,
  User,
  Tag as Itag,
} from '@/types';
import { TagColorMap } from '@/utils/constants';
import { CreditCardOutlined } from '@ant-design/icons';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, DatePicker, Input, InputNumber, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { FC, useState } from 'react';
import UserSelect, { ValueType } from '../UserSelect';

export type TableRowProps = {};


const TableRow: FC<TableRowProps> = ({}) => {
  const [currentUser] = useAtom(currentUserAtom);

  const [flowRecord, setFlowRecord] = useState<{
    amount?: number;
    desc?: string;
    dealAt?: Dayjs | null;
    tagId?: string;
    savingAccountId?: string;
    trader?: {
      id: string;
      nickname: string;
    };
  }>({
    trader: currentUser!,
    dealAt: dayjs(),
  });



  return (
    <div className="table-row">
      <div className="table-cell p-2">
        <InputNumber
          formatter={(value) => `¥ ${value}`}
          precision={2}
          className="w-full"
          min={0}
          value={flowRecord.amount}
          style={{
            ...(selectedTag && {
              borderColor: TagColorMap[selectedTag.type].color,
            }),
          }}
          onChange={(value) =>
            setFlowRecord((prev) => ({ ...prev, amount: value }))
          }
        />
      </div>
      <div className="table-cell p-2">
        <Input
          className="w-full"
          value={flowRecord.desc}
          onChange={(e) =>
            setFlowRecord((prev) => ({ ...prev, desc: e.target.value }))
          }
        />
      </div>
      <div className="table-cell p-2">
        <DatePicker
          className="w-full"
          value={flowRecord.dealAt}
          onChange={(value) =>
            setFlowRecord((prev) => ({ ...prev, dealAt: value }))
          }
        />
      </div>
      <div className="table-cell p-2">
        <Select
          className="w-full"
          value={flowRecord.tagId}
          onChange={(value) =>
            setFlowRecord((prev) => ({ ...prev, tagId: value }))
          }
        >
          {tags.map((tag) => {
            return (
              <Select.Option value={tag.id} key={tag.id}>
                <span
                  className="inline-block leading-4 rounded px-2 py-1 text-white"
                  style={{ background: TagColorMap[tag.type].color }}
                >
                  {tag.name}
                </span>
              </Select.Option>
            );
          })}
        </Select>
      </div>
      <div className="table-cell p-2">
        <Select
          className="w-full"
          value={flowRecord.savingAccountId}
          onChange={(value) =>
            setFlowRecord((prev) => ({ ...prev, savingAccountId: value }))
          }
        >
          {savingAccounts.map((it) => {
            return (
              <Select.Option value={it.id} key={it.id}>
                <span className="flex items-center">
                  <CreditCardOutlined />
                  <span className="pl-2">
                    {it.name}(¥{it.amount})
                  </span>
                </span>
              </Select.Option>
            );
          })}
        </Select>
      </div>
      <div className="table-cell p-2">
        <UserSelect
          className="w-full"
          includeSelf={true}
          value={{
            label: flowRecord.trader!.nickname,
            value: flowRecord.trader,
          }}
          onChange={(value) =>
            setFlowRecord((prev) => ({
              ...prev,
              trader: (value as ValueType).value,
            }))
          }
        />
      </div>
      <div className="table-cell p-2">
        <Button type="primary" onClick={handleFlowRecord}>
          保存
        </Button>
      </div>
    </div>
  );
};

export default TableRow;
