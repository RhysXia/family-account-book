import { useParams } from 'react-router-dom';

const SavingAccountDetailPage = () => {
  const { savingAccountId } = useParams();
  console.log(savingAccountId);

  return <div>SavingAccountDetailPage</div>;
};

export default SavingAccountDetailPage;
