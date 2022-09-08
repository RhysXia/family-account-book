import useConstantFn from '@/hooks/useConstanFn';
import { currentUserAtom } from '@/store';
import { FlowRecord, SavingAccount, Tag as Itag, Tag } from '@/types';
import { TagColorMap } from '@/utils/constants';
import { CreditCardOutlined } from '@ant-design/icons';
import { Button, Input, InputNumber, Select, message } from 'antd';
import { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { FC, useState } from 'react';
import DatePicker from '../../DatePicker';
import UserSelect, { ValueType } from '../../UserSelect';

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

export type TableRowForCreateProps = {
  defaultFlowRecord: Partial<FlowRecordForCreate>;
  tags: Array<Tag>;
  savingAccounts: Array<SavingAccount>;
  onCreate?: (data: FlowRecordForCreate) => void;
  buttonText?: string;
};

const TableRowForCreate: FC<TableRowForCreateProps> = ({
  tags,
  savingAccounts,
  defaultFlowRecord,
  buttonText = '新建',
  onCreate,
}) => {
  const [currentUser] = useAtom(currentUserAtom);

  const [flowRecord, setFlowRecord] = useState(defaultFlowRecord);

  const selectedTag = tags.find((it) => it.id === flowRecord.tagId);

  const handleCreate = useConstantFn(() => {
    const { desc, amount, traderId, tagId, savingAccountId, dealAt } =
      flowRecord;

    if (!amount) {
      return message.error('请输入金额');
    }
    if (!traderId) {
      return message.error('请选择交易人');
    }
    if (!tagId) {
      return message.error('请选择标签');
    }

    if (!savingAccountId) {
      return message.error('请选择账本');
    }

    if (!dealAt) {
      return message.error('请选择交易日期');
    }

    onCreate?.({
      desc,
      amount,
      traderId,
      tagId,
      savingAccountId,
      dealAt,
    });
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
            label: currentUser!.nickname,
            value: currentUser,
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
        <Button type="primary" onClick={handleCreate}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default TableRowForCreate;
