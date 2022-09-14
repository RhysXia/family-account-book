import { useAppQuery } from '@/apollo';
import { Category, Pagination, PaginationResult, Tag } from '@/types';
import { gql } from '@apollo/client';

const GET_TAGS_BY_ACCOUNT_BOOK_ID = gql`
  query GetTagsByAccountBookId($accountBookId: ID!, $pagination: Pagination) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        tags(pagination: $pagination) {
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

const GET_TAGS_WITH_CATEGORY_BY_ACCOUNT_BOOK_ID = gql`
  query GetTagsWithCategoryByAccountBookId(
    $accountBookId: ID!
    $pagination: Pagination
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        tags(pagination: $pagination) {
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

export const useGetTags = (variables: {
  accountBookId: string;
  pagination?: Pagination;
}) => {
  return useAppQuery<{
    node: {
      tags: PaginationResult<Tag>;
    };
  }>(GET_TAGS_BY_ACCOUNT_BOOK_ID, {
    variables,
  });
};

export const useGetTagsWithCategory = (variables: {
  accountBookId: string;
  pagination?: Pagination;
}) => {
  return useAppQuery<{
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
  }>(GET_TAGS_WITH_CATEGORY_BY_ACCOUNT_BOOK_ID, {
    variables,
  });
};
