import { useGetCategoryListByAccountBookId } from '@/graphql/category';
import { CreateTagInput, useCreateTag } from '@/graphql/tag';
import { activeAccountBookAtom } from '@/store';
import { CategoryTypeInfoMap } from '@/utils/constants';
import { Modal, Form, Input, Select, Tag } from 'antd';
import { useAtom } from 'jotai';
import { FC, useCallback } from 'react';

export type CreateModalProps = {
  visible: boolean;
  onChange: (v: boolean) => void;
};

const CreateModal: FC<CreateModalProps> = ({ visible, onChange }) => {
  const [form] = Form.useForm<CreateTagInput>();
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [createTag] = useCreateTag();

  const { data: categoryData } = useGetCategoryListByAccountBookId({
    accountBookId: activeAccountBook!.id,
    pagination: {
      orderBy: [
        {
          field: 'order',
          direction: 'DESC',
        },
        {
          field: 'createdAt',
          direction: 'DESC',
        },
      ],
    },
  });

  const handleOk = useCallback(async () => {
    await form.validateFields();
    await createTag({
      variables: {
        tag: {
          ...form.getFieldsValue(),
        },
      },
    });

    onChange(false);

    form.resetFields();
  }, [form, createTag, onChange]);

  const handleCancel = useCallback(() => {
    form.resetFields();
    onChange(false);
  }, [form, onChange]);

  const title = <h1 className="font-bold text-xl mb-2">新建分类</h1>;

  return (
    <Modal
      visible={visible}
      title={title}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form form={form} labelCol={{ span: 4 }}>
        <Form.Item
          label="名称"
          name="name"
          rules={[{ required: true, message: '名称不能为空' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="所属分类"
          name="categoryId"
          rules={[{ required: true, message: '分类不能为空' }]}
        >
          <Select showSearch={true} optionFilterProp="name">
            {categoryData?.data.map((it) => (
              <Select.Option value={it.id} key={it.id} name={it.name}>
                <Tag color={CategoryTypeInfoMap[it.type].color}>{it.name}</Tag>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="描述" name="desc">
          <Input.TextArea autoSize={{ minRows: 4 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateModal;
