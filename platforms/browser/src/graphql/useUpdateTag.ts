import { useAppMutation } from '@/apollo';
import { gql } from '@apollo/client';

const UPDATE_TAG = gql`
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

const useUpdateTag = () => {
  return useAppMutation<
    {
      updateTag: {
        id: string;
      };
    },
    {
      tag: UpdateTagInput;
    }
  >(UPDATE_TAG);
};

export default useUpdateTag;
