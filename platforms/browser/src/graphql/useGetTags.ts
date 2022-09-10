import { PaginationResult, Tag } from '@/types';
import { gql, useQuery } from '@apollo/client';

const GET_TAGS_BY_ACCOUNT_BOOK_ID = gql`
  query GetTagsByAccountBookId($accountBookId: ID!) {
    node(id: $accountBookId) {
      ... on AccountBook {
        id
        tags {
          total
          data {
            id
            name
            type
            creator {
              id
              nickname
            }
          }
        }
      }
    }
  }
`;

const useGetTags = (variables: { accountBookId: string }) => {
  return useQuery<{
    node: {
      tags: PaginationResult<
        Tag & {
          creator: {
            id: string;
            nickname: string;
          };
        }
      >;
    };
  }>(GET_TAGS_BY_ACCOUNT_BOOK_ID, {
    variables,
  });
};

export default useGetTags;
