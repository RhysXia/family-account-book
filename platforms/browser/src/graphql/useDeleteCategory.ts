import { useAppMutation } from '@/apollo';
import { gql } from '@apollo/client';

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

const useDeleteCategory = () => {
  return useAppMutation<
    {
      deleteCategory: boolean;
    },
    {
      id: string;
    }
  >(DELETE_CATEGORY);
};

export default useDeleteCategory;
