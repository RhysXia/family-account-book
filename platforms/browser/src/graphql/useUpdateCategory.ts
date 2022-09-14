import { useAppMutation } from '@/apollo';
import { gql } from '@apollo/client';

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($category: UpdateCategoryInput!) {
    updateCategory(category: $category) {
      id
    }
  }
`;

export type UpdateCategoryInput = {
  id: string;
  name?: string;
  desc?: string;
};

const useUpdateCategory = () => {
  return useAppMutation<
    { id: string },
    {
      category: UpdateCategoryInput;
    }
  >(UPDATE_CATEGORY);
};

export default useUpdateCategory;
