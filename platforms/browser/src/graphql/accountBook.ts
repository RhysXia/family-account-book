import { useAppMutation, useAppQuery } from '@/apollo';
import { AccountBook, PaginationResult, User } from '@/types';
import { gql } from '@apollo/client';

export const GET_ACCOUNT_BOOK_BY_ID = gql`
  query GetAccountBookById($id: ID!) {
    node(id: $id) {
      ... on AccountBook {
        id
        name
        desc
        createdAt
        updatedAt
        admins {
          id
          nickname
          username
          email
          avatar
        }
        members {
          id
          nickname
          username
          email
          avatar
        }
      }
    }
  }
`;

export type AccountBookDetail = AccountBook & {
  admins: Array<User>;
  members: Array<User>;
};

export const useGetAccountBookById = (variables: { id: string }) => {
  const { data, ...others } = useAppQuery<{
    node: AccountBookDetail;
  }>(GET_ACCOUNT_BOOK_BY_ID, {
    variables,
  });

  return {
    data: data?.node,
    ...others,
  };
};

const GET_SELF_ACCOUNT_BOOK_LIST = gql`
  query GetSelfAccountBookList {
    currentUser {
      id
      accountBooks {
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
`;

export const useGetSelfAccountBookList = () => {
  const { data, ...others } = useAppQuery<{
    currentUser: {
      accountBooks: PaginationResult<AccountBook>;
    };
  }>(GET_SELF_ACCOUNT_BOOK_LIST);
  return {
    data: data?.currentUser.accountBooks,
    ...others,
  };
};

export const CREATE_ACCOUNT_BOOK = gql`
  mutation CreateAccountBook($accountBook: CreateAccountBookInput!) {
    createAccountBook(accountBook: $accountBook) {
      id
      name
      desc
      createdAt
      updatedAt
    }
  }
`;

export type CreateAccountBookInput = {
  name: string;
  desc?: string;
  adminIds: Array<string>;
  memberIds: Array<string>;
};

export const useCreateAccountBook = () => {
  return useAppMutation<
    {
      createAccountBook: AccountBook;
    },
    {
      accountBook: CreateAccountBookInput;
    }
  >(CREATE_ACCOUNT_BOOK, {
    refetchQueries({ errors, data }) {
      if (errors) {
        return [];
      }
      return [
        GET_SELF_ACCOUNT_BOOK_LIST,
        {
          query: GET_ACCOUNT_BOOK_BY_ID,
          variables: {
            id: data?.createAccountBook.id,
          },
        },
      ];
    },
  });
};
