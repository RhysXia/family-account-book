import { useAppMutation, useAppQuery } from '@/apollo';
import {
  Category,
  CategoryType,
  Pagination,
  PaginationResult,
  Tag,
  User,
} from '@/types';
import { gql } from '@apollo/client';

export const GET_CATEGORY_LIST_BY_ACCOUNT_BOOK_ID = gql`
  query GetCategoryListByAccountBookId(
    $accountBookId: ID!
    $filter: AccountBookCategoryFilter
    $pagination: Pagination
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        categories(filter: $filter, pagination: $pagination) {
          total
          data {
            id
            name
            type
            desc
            createdBy {
              id
              nickname
              username
              email
              avatar
            }
            createdAt
            updatedAt
          }
        }
      }
    }
  }
`;

export type AccountBookCategoryFilter = {
  type?: CategoryType;
};

export const useGetCategoryListByAccountBookId = (variables: {
  accountBookId: string;
  filter?: AccountBookCategoryFilter;
  pagination?: Pagination;
}) => {
  const { data, ...others } = useAppQuery<{
    node: {
      categories: PaginationResult<
        Category & {
          createdBy: User;
        }
      >;
    };
  }>(GET_CATEGORY_LIST_BY_ACCOUNT_BOOK_ID, {
    variables,
  });

  return {
    data: data?.node.categories,
    ...others,
  };
};

export const GET_CATEGORY_LIST_WITH_TAG_LIST_BY_ACCOUNT_BOOK_ID = gql`
  query GetCategoryListByAccountBookId(
    $accountBookId: ID!
    $filter: AccountBookCategoryFilter
    $pagination: Pagination
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        categories(filter: $filter, pagination: $pagination) {
          total
          data {
            id
            name
            type
            desc
            createdBy {
              id
              nickname
              username
              email
              avatar
            }
            createdAt
            updatedAt
            tags {
              id
              name
              desc
            }
          }
        }
      }
    }
  }
`;

export const useGetCategoryListWithTagListByAccountBookId = (variables: {
  accountBookId: string;
  pagination?: Pagination;
}) => {
  const { data, ...others } = useAppQuery<{
    node: {
      categories: PaginationResult<
        Category & {
          createdBy: User;
        } & {
          tags: PaginationResult<Tag>;
        }
      >;
    };
  }>(GET_CATEGORY_LIST_WITH_TAG_LIST_BY_ACCOUNT_BOOK_ID, {
    variables,
  });

  return {
    data: data?.node.categories,
    ...others,
  };
};

export const CREATE_CATEGORY = gql`
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

export const useCreateCategory = () => {
  return useAppMutation<
    {
      createCategory: Category;
    },
    {
      category: CreateCategoryInput;
    }
  >(CREATE_CATEGORY, {
    refetchQueries({ errors }) {
      if (errors) {
        return [];
      }
      return [
        GET_CATEGORY_LIST_BY_ACCOUNT_BOOK_ID,
        GET_CATEGORY_LIST_WITH_TAG_LIST_BY_ACCOUNT_BOOK_ID,
      ];
    },
  });
};

export const UPDATE_CATEGORY = gql`
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

export const useUpdateCategory = () => {
  return useAppMutation<
    {
      updateCategory: {
        id: string;
      };
    },
    {
      category: UpdateCategoryInput;
    }
  >(UPDATE_CATEGORY, {
    refetchQueries({ errors }) {
      if (errors) {
        return [];
      }
      return [
        GET_CATEGORY_LIST_BY_ACCOUNT_BOOK_ID,
        GET_CATEGORY_LIST_WITH_TAG_LIST_BY_ACCOUNT_BOOK_ID,
      ];
    },
  });
};

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export const useDeleteCategory = () => {
  return useAppMutation<
    {
      deleteCategory: boolean;
    },
    {
      id: string;
    }
  >(DELETE_CATEGORY, {
    refetchQueries({ errors }) {
      if (errors) {
        return [];
      }
      return [
        GET_CATEGORY_LIST_BY_ACCOUNT_BOOK_ID,
        GET_CATEGORY_LIST_WITH_TAG_LIST_BY_ACCOUNT_BOOK_ID,
      ];
    },
  });
};
