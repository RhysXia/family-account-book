import { useParams } from 'react-router-dom';

const TagDetailPage = () => {
  const { savingAccountId } = useParams();
  console.log(savingAccountId);

  return <div>TagDetailPage</div>;
};

export default TagDetailPage;
