import { PlusOutlined } from '@ant-design/icons';
import { gql, useQuery } from '@apollo/client';
import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardAction from '../../../../components/DashboardAction';
import { activeAccountBookAtom } from '../../../../store';
import { PaginationResult, SavingAccount } from '../../../../types';

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

const GET_SAVING_ACCOUNTS = gql`
  query ($accountBookId: Int!) {
    getAuthSavingAccountsByAccountBookId(accountBookId: $accountBookId) {
      data {
        id
        name
        desc
        amount
        createdAt
        updatedAt
      }
    }
  }
`;

const SavingAccountPage = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const navigate = useNavigate();

  const { data } = useQuery<{
    getAuthSavingAccountsByAccountBookId: PaginationResult<SavingAccount>;
  }>(GET_SAVING_ACCOUNTS, {
    variables: {
      accountBookId: activeAccountBook?.id,
    },
  });

  const handleCreateButton = useCallback(() => {
    navigate('create');
  }, [navigate]);

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
        dataSource={data?.getAuthSavingAccountsByAccountBookId.data.map(
          (it) => ({ ...it, key: it.id }),
        )}
      />
    </DashboardAction>
  );
};

export default SavingAccountPage;
