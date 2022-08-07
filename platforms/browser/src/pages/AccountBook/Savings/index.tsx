import { PlusOutlined } from '@ant-design/icons';
import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { getSavingsList } from '../../../api';
import DashboardAction from '../../../components/DashboardAction';
import SavingCreate from '../../../components/savings/SavingsCreate';
import { activeAccountBook } from '../../../store/accountBook';
import { Savings as SavingsType } from '../../../types/savings';

const columns: ColumnsType<any> = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '描述',
    dataIndex: 'desc',
    key: 'desc',
  },
  {
    title: '余额',
    dataIndex: 'amount',
    key: 'amount',
    render(amount: number) {
      return `￥${amount.toLocaleString()}`;
    },
  },
];

const Savings = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [accountBook] = useAtom(activeAccountBook);

  const [savingsList, setSavingsList] = useState<Array<SavingsType>>([]);

  const handleGetSavingList = useCallback(async () => {
    const list = await getSavingsList(accountBook!.id);
    setSavingsList(list);
  }, [accountBook]);

  useEffect(() => {
    handleGetSavingList();
  }, [handleGetSavingList]);

  const handleCreateButton = useCallback(() => {
    setCreateModalVisible(true);
  }, []);

  const handleSavingCreated = useCallback(() => {
    setCreateModalVisible(false);
    handleGetSavingList();
  }, [handleGetSavingList]);

  const actions = (
    <>
      <button
        onClick={handleCreateButton}
        className="flex items-center justify-center w-7 h-7 rounded transition-all bg-indigo-500 text-white hover:bg-indigo-400"
      >
        <PlusOutlined />
      </button>
    </>
  );

  return (
    <DashboardAction title="储蓄" actions={actions}>
      <Table
        pagination={false}
        columns={columns}
        dataSource={savingsList.map((it) => ({ ...it, key: it.id }))}
      />
      <SavingCreate
        onCancel={() => setCreateModalVisible(false)}
        onOk={handleSavingCreated}
        visible={createModalVisible}
      />
    </DashboardAction>
  );
};

export default Savings;
