import { useGetTagsWithCategoryByAccountBookId } from '@/graphql/tag';
import { CategoryTypeInfoMap } from '@/utils/constants';
import { Select, SelectProps } from 'antd';
import { FC, useMemo, useState } from 'react';
import { Category, Tag } from '../../types';

export type TagSelectProps = SelectProps & {
  accountBookId: string;
};

const TagSelect: FC<TagSelectProps> = ({ accountBookId, ...others }) => {
  const { data: tagsData } = useGetTagsWithCategoryByAccountBookId({
    accountBookId,
  });

  const tags = useMemo(() => tagsData?.data || [], [tagsData]);

  const tagsGroupByCategory = useMemo(() => {
    const map = new Map<string, Array<Tag>>();

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

  const filteredTagsGroupByCategory = tagsGroupByCategory
    .map((category) => {
      const filteredTags = category.tags.filter((tag) =>
        tag.name.includes(searchText),
      );

      return {
        ...category,
        tags: filteredTags,
      };
    })
    .filter((it) => it.tags.length);

  console.log(filteredTagsGroupByCategory);

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
                  <span
                    className="inline-block leading-4 rounded px-2 py-1 text-white"
                    style={{
                      background: CategoryTypeInfoMap[category.type].color,
                    }}
                  >
                    {tag.name}
                  </span>
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
