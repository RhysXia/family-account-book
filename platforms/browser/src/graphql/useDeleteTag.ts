import { gql, useMutation } from '@apollo/client';

const DELETE_TAG = gql`
  mutation DeleteTag($id: ID!) {
    deleteTag(id: $id)
  }
`;

const useDeleteTag = () => {
  return useMutation<
    { tagId: number },
    {
      id: string;
    }
  >(DELETE_TAG);
};

export default useDeleteTag;
