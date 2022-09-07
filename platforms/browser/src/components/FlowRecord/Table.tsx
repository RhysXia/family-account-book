import { FC } from 'react';

export type TableProps = {};

const Table: FC<TableProps> = (props) => {
  return (
    <div className="mx-auto w-full bg-white p-6 rounded">
      <div className="table w-full rounded overflow-hidden border-collapse">
        <div className="table-header-group bg-slate-200 font-bold">
          <div className="table-cell p-2" style={{ width: 120 }}>
            金额
          </div>
          <div className="table-cell p-2">描述</div>
          <div className="table-cell p-2">日期</div>
          <div className="table-cell p-2" style={{ minWidth: 150 }}>
            标签
          </div>
          <div className="table-cell p-2" style={{ minWidth: 150 }}>
            账户
          </div>
          <div className="table-cell p-2" style={{ minWidth: 120 }}>
            交易员
          </div>
          <div className="table-cell p-2" style={{ minWidth: 100 }}>
            操作
          </div>
        </div>
        <div className="table-row-group">
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

          {data?.node.flowRecords.data.map((it) => {
            return (
              <div className="table-row">
                <div className="table-cell p-2">{it.amount}</div>
                <div className="table-cell p-2">{it.desc}</div>
                <div className="table-cell p-2">{it.createdAt}</div>
                <div className="table-cell p-2">{it.tag.name}</div>
                <div className="table-cell p-2">{it.trader.nickname}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Table;
