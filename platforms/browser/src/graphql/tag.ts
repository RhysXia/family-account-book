import { useAppMutation, useAppQuery } from '@/apollo';
import { Category, Pagination, PaginationResult, Tag } from '@/types';
import { gql } from '@apollo/client';

export const GET_TAG_LIST_BY_ACCOUNT_BOOK_ID = gql`
  query GetTagListByAccountBookId(
    $accountBookId: ID!
    $filter: TagFilter
    $pagination: Pagination
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        tags(filter: $filter, pagination: $pagination) {
          total
          data {
            id
            name
            desc
            createdAt
            updatedAt
          }
        }
      }
    }
  }
`;

export const GET_TAG_LIST_WITH_CATEGORY_BY_ACCOUNT_BOOK_ID = gql`
  query GetTagsWithCategoryByAccountBookId(
    $accountBookId: ID!
    $filter: AccountBookTagFilter
    $pagination: Pagination
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        tags(filter: $filter, pagination: $pagination) {
          total
          data {
            id
            name
            desc
            creator {
              id
              nickname
            }
            createdAt
            updatedAt
            category {
              id
              name
              desc
              type
            }
          }
        }
      }
    }
  }
`;

export type AccountBookTagFilter = {
  categoryId?: string;
};

export const useGetTagListByAccountBookId = (variables: {
  accountBookId: string;
  filter?: AccountBookTagFilter;
  pagination?: Pagination;
}) => {
  const { data, ...others } = useAppQuery<{
    node: {
      tags: PaginationResult<Tag>;
    };
  }>(GET_TAG_LIST_BY_ACCOUNT_BOOK_ID, {
    variables,
  });

  return {
    data: data?.node.tags,
    ...others,
  };
};

export const useGetTagsWithCategoryByAccountBookId = (variables: {
  accountBookId: string;
  filter?: AccountBookTagFilter;
  pagination?: Pagination;
}) => {
  const { data, ...others } = useAppQuery<{
    node: {
      tags: PaginationResult<
        Tag & {
          creator: {
            id: string;
            nickname: string;
          };
          category: Category;
        }
      >;
    };
  }>(GET_TAG_LIST_WITH_CATEGORY_BY_ACCOUNT_BOOK_ID, {
    variables,
  });

  return {
    data: data?.node.tags,
    ...others,
  };
};

export const CREATE_TAG = gql`
  mutation CreateTag($tag: CreateTagInput!) {
    createTag(tag: $tag) {
      id
      name
      desc
      createdAt
      updatedAt
    }
  }
`;

export type CreateTagInput = {
  categoryId: string;
  name: string;
  desc?: string;
};

export const useCreateTag = () => {
  return useAppMutation<
    {
      createTag: Tag;
    },
    {
      tag: CreateTagInput;
    }
  >(CREATE_TAG, {
    refetchQueries({ errors }) {
      if (errors) {
        return [];
      }

      return [
        GET_TAG_LIST_BY_ACCOUNT_BOOK_ID,
        GET_TAG_LIST_WITH_CATEGORY_BY_ACCOUNT_BOOK_ID,
      ];
    },
  });
};

export const UPDATE_TAG = gql`
  mutation UpdateTag($tag: UpdateTagInput!) {
    updateTag(tag: $tag) {
      id
    }
  }
`;

export type UpdateTagInput = {
  id: string;
  name?: string;
  desc?: string;
};

export const useUpdateTag = () => {
  return useAppMutation<
    {
      updateTag: {
        id: string;
      };
    },
    {
      tag: UpdateTagInput;
    }
  >(UPDATE_TAG, {
    refetchQueries({ errors }) {
      if (errors) {
        return [];
      }

      return [
        GET_TAG_LIST_BY_ACCOUNT_BOOK_ID,
        GET_TAG_LIST_WITH_CATEGORY_BY_ACCOUNT_BOOK_ID,
      ];
    },
  });
};

export const DELETE_TAG = gql`
  mutation DeleteTag($id: ID!) {
    deleteTag(id: $id)
  }
`;

export const useDeleteTag = () => {
  return useAppMutation<
    boolean,
    {
      id: string;
    }
  >(DELETE_TAG, {
    refetchQueries({ errors }) {
      if (errors) {
        return [];
      }

      return [
        GET_TAG_LIST_BY_ACCOUNT_BOOK_ID,
        GET_TAG_LIST_WITH_CATEGORY_BY_ACCOUNT_BOOK_ID,
      ];
    },
  });
};
