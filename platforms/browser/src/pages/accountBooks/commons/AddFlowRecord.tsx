import { useGetSavingAccountListByAccountBookId } from '@/graphql/savingAccount';
import { useGetTagsWithCategoryByAccountBookId } from '@/graphql/tag';
import { activeAccountBookAtom } from '@/store';
import { useAtom } from 'jotai';
import { FC, useCallback, useMemo } from 'react';
import CreateModel from '../_accountBookId/flowRecords/commons/CreateModel';

export type AddFlowRecordProps = {
  visible: boolean;
  onChange: (v: boolean) => void;
};

const AddFlowRecord: FC<AddFlowRecordProps> = ({ visible, onChange }) => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const { data: tagsData } = useGetTagsWithCategoryByAccountBookId({
    accountBookId: activeAccountBook!.id!,
  });

  const users = useMemo(() => {
    const { members, admins } = activeAccountBook!;
    return [...admins, ...members];
  }, [activeAccountBook]);

  const {
    data: accountBookWithSavingAccounts,
    refetch: refetchSavingAccounts,
  } = useGetSavingAccountListByAccountBookId({
    accountBookId: activeAccountBook!.id!,
  });

  const savingAccounts = useMemo(
    () => accountBookWithSavingAccounts?.data || [],
    [accountBookWithSavingAccounts],
  );

  const tags = useMemo(() => tagsData?.data || [], [tagsData]);

  const handleRefreshSavingAccounts = useCallback(async () => {
    await refetchSavingAccounts();
  }, [refetchSavingAccounts]);

  return (
    <CreateModel
      visible={visible}
      tags={tags}
      savingAccounts={savingAccounts}
      users={users}
      onRefreshSavingAccounts={handleRefreshSavingAccounts}
      onChange={onChange}
    />
  );
};

export default AddFlowRecord;
