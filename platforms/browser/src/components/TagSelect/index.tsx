import { useGetTagsWithCategoryByAccountBookId } from '@/graphql/tag';
import { CategoryTypeInfoMap } from '@/utils/constants';
import { Select, SelectProps, Tag } from 'antd';
import { FC, useMemo, useState } from 'react';
import { Category, Tag as ITag } from '../../types';

export type TagSelectProps = SelectProps & {
  accountBookId: string;
};

const TagSelect: FC<TagSelectProps> = ({ accountBookId, ...others }) => {
  const { data: tagsData } = useGetTagsWithCategoryByAccountBookId({
    accountBookId,
  });

  const tags = useMemo(() => tagsData?.data || [], [tagsData]);

  const tagsGroupByCategory = useMemo(() => {
    const map = new Map<string, Array<ITag>>();

    const categories: Array<Category> = [];

    tags.forEach((it) => {
      const category = it.category;
      let arr = map.get(category.id);

      if (!arr) {
        categories.push(category);
        arr = [];
      }

      arr.push(it);

      map.set(category.id, arr);
    });

    return categories.map((it) => ({
      ...it,
      tags: map.get(it.id)!,
    }));
  }, [tags]);

  const [searchText, setSearchText] = useState('');

  const [groupMatch = '', tagMatch] = searchText.trim().split(/\s+/);

  const filteredTagsGroupByCategory = tagsGroupByCategory
    .map((category) => {
      if (tagMatch) {
        if (category.name.includes(groupMatch)) {
          const filteredTags = category.tags.filter((tag) =>
            tag.name.includes(tagMatch),
          );
          return {
            ...category,
            tags: filteredTags,
          };
        }

        return {
          ...category,
          tags: [],
        };
      }

      if (category.name.includes(groupMatch)) {
        return category;
      }

      const filteredTags = category.tags.filter((tag) =>
        tag.name.includes(groupMatch),
      );

      return {
        ...category,
        tags: filteredTags,
      };
    })
    .filter((it) => it.tags.length);
  return (
    <Select
      {...others}
      filterOption={false}
      showSearch={true}
      onSearch={setSearchText}
    >
      {filteredTagsGroupByCategory.map((category) => {
        return (
          <Select.OptGroup label={category.name} key={category.id}>
            {category.tags.map((tag) => {
              return (
                <Select.Option value={tag.id} key={tag.id}>
                  <Tag color={CategoryTypeInfoMap[category.type].color}>
                    {tag.name}
                  </Tag>
                </Select.Option>
              );
            })}
          </Select.OptGroup>
        );
      })}
    </Select>
  );
};

export default TagSelect;
