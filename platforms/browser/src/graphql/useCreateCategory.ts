import { useAppMutation } from '@/apollo';
import { Category, CategoryType } from '@/types';
import { gql } from '@apollo/client';

const CREATE_CATEGORY = gql`
  mutation CreateCategory($category: CreateCategoryInput!) {
    createCategory(category: $category) {
      id
      name
      type
      createdAt
      updatedAt
    }
  }
`;

export type CreateCategoryInput = {
  accountBookId: string;
  name: string;
  desc?: string;
  type: CategoryType;
};

const useCreateCategory = () => {
  return useAppMutation<
    {
      createCategory: Category;
    },
    {
      category: CreateCategoryInput;
    }
  >(CREATE_CATEGORY);
};

export default useCreateCategory;
