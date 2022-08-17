import { gql } from '@apollo/client';
import { useAtom } from 'jotai';
import { activeAccountBookAtom } from '../../../../store';

const GET_FLOW_RECORDS = gql``

const FlowRecordsPage = () => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  return <div>flowrecords</div>;
};

export default FlowRecordsPage;
