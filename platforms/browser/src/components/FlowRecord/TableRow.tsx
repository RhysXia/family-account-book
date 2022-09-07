import { currentUserAtom } from '@/store';
import {
  FlowRecord,
  PaginationResult,
  SavingAccount,
  User,
  Tag as Itag,
  Tag,
} from '@/types';
import { TagColorMap } from '@/utils/constants';
import { CreditCardOutlined } from '@ant-design/icons';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, Input, InputNumber, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { FC, useState } from 'react';
import DatePicker from '../DatePicker';
import UserSelect, { ValueType } from '../UserSelect';

export enum TableRowType {
  CREATE,
  READ_ONLY,
  EDIT,
}

export type FlowRecordData = FlowRecord & {
  trader: {
    id: string;
    nickname: string;
  };
  tag: Itag;
};

export type FlowRecordForCreate = {
  desc?: string;
  amount: number;
  traderId: string;
  tagId: string;
  savingAccountId: string;
  dealAt: Dayjs;
};

export type FlowRecordForUpdate = Partial<FlowRecordForCreate> & {
  id: string;
};

export type TableRowProps = {
  type: TableRowType;
  flowRecord?: FlowRecordData;
  tags?: Array<Tag>;
  onUpdate?: (data: FlowRecordForCreate) => void;
  onCreate?: (data: FlowRecordForUpdate) => void;
};

const TableRow: FC<TableRowProps> = ({
  type,
  flowRecord,
  tags = [],
  onCreate,
  onUpdate,
}) => {
  if (type === TableRowType.CREATE) {
  }

  if (type === TableRowType.EDIT || type === TableRowType.READ_ONLY) {
    if (!flowRecord) {
      throw new Error('编辑模式和只读模式需要传递flowRecord');
    }
  }

  const selectedTag = tags.find((it) => it.id === flowRecord?.tag.id);

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

type TableRowForCreateProps = {
  tags: Array<Tag>;
  savingAccounts: Array<SavingAccount>;
  onCreate?: (data: FlowRecordForCreate) => void;
};

const TableRowForCreate: FC<TableRowForCreateProps> = ({
  tags,
  savingAccounts,
}) => {
  const [flowRecord, setFlowRecord] = useState<Partial<FlowRecordForCreate>>(
    {},
  );

  const selectedTag = tags.find((it) => it.id === flowRecord.tagId);

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
          value={flowRecord?.desc}
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
            setFlowRecord((prev) => ({ ...prev, dealAt: value! }))
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
