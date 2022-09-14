import { useAppMutation } from '@/apollo';
import { Tag, TagType } from '@/types';
import { gql } from '@apollo/client';

const CREATE_TAG = gql`
  mutation CreateTag($name: String!, $type: TagType!, $accountBookId: ID!) {
    createTag(
      tag: { name: $name, type: $type, accountBookId: $accountBookId }
    ) {
      id
      name
      type
      createdAt
      updatedAt
    }
  }
`;

export type CreateTagInput = {
  accountBookId: string;
  name: string;
  type: TagType;
};

const useCreateTag = () => {
  return useAppMutation<
    {
      createTag: Tag;
    },
    CreateTagInput
  >(CREATE_TAG);
};

export default useCreateTag;
