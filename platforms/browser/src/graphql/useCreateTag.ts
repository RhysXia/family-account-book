import { useAppMutation } from '@/apollo';
import { Tag } from '@/types';
import { gql } from '@apollo/client';

const CREATE_TAG = gql`
  mutation CreateTag($tag: CreateTagInput) {
    createTag(tag: $tag) {
      id
      name
      type
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

const useCreateTag = () => {
  return useAppMutation<
    {
      createTag: Tag;
    },
    {
      tag: CreateTagInput;
    }
  >(CREATE_TAG);
};

export default useCreateTag;
