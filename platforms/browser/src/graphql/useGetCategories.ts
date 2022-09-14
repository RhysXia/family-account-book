import { useAppQuery } from '@/apollo';
import { Category, Pagination, PaginationResult } from '@/types';
import { gql } from '@apollo/client';

const GET_CATEGORIES_BY_ACCOUNT_BOOK_ID = gql`
  query GetCategoriesByAccountBookId(
    $accountBookId: ID!
    $pagination: Pagination
  ) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        categories(pagination: $pagination) {
          total
          data {
            id
            name
            type
            desc
            creator {
              id
              nickname
            }
            createdAt
            updatedAt
          }
        }
      }
    }
  }
`;

const useGetCategories = (variables: {
  accountBookId: string;
  pagination?: Pagination;
}) => {
  return useAppQuery<{
    node: {
      categories: PaginationResult<
        Category & {
          creator: {
            id: string;
            nickname: string;
          };
        }
      >;
    };
  }>(GET_CATEGORIES_BY_ACCOUNT_BOOK_ID, {
    variables,
  });
};

export default useGetCategories;
