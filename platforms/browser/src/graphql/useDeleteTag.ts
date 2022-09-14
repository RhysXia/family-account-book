import { useAppMutation } from '@/apollo';
import { gql } from '@apollo/client';

const DELETE_TAG = gql`
  mutation DeleteTag($id: ID!) {
    deleteTag(id: $id)
  }
`;

const useDeleteTag = () => {
  return useAppMutation<
    { tagId: number },
    {
      id: string;
    }
  >(DELETE_TAG);
};

export default useDeleteTag;
