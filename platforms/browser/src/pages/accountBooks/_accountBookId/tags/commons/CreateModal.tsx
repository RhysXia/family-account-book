import useCreateTag, { CreateTagInput } from '@/graphql/useCreateTag';
import useGetCategories from '@/graphql/useGetCategories';
import { activeAccountBookAtom } from '@/store';
import { CategoryTypeInfoMap } from '@/utils/constants';
import { Modal, Form, Input, Select } from 'antd';
import { useAtom } from 'jotai';
import { FC, useCallback } from 'react';

export type CreateModalProps = {
  visible: boolean;
  onCreated: () => Promise<void>;
  onCancelled: () => void;
};

const CreateModal: FC<CreateModalProps> = ({
  visible,
  onCancelled,
  onCreated,
}) => {
  const [form] = Form.useForm<CreateTagInput>();
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [createTag] = useCreateTag();

  const { data: categoryData } = useGetCategories({
    accountBookId: activeAccountBook!.id,
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

    await onCreated();

    form.resetFields();
  }, [form, createTag, onCreated]);

  const handleCancel = useCallback(() => {
    form.resetFields();
    onCancelled();
  }, [form, onCancelled]);

  const title = <h1 className="font-bold text-xl mb-2">新建分类</h1>;

  return (
    <Modal
      visible={visible}
      title={title}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form form={form} labelCol={{ span: 3 }}>
        <Form.Item
          label="名称"
          name="name"
          rules={[{ required: true, message: '名称不能为空' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="所属分类" name="categoryId">
          <Select>
            {categoryData?.node.categories.data.map((it) => (
              <Select.Option value={it.id} key={it.id}>
                <span
                  className="inline-block leading-4 rounded px-2 py-1 text-white"
                  style={{
                    background: CategoryTypeInfoMap[it.type].color,
                  }}
                >
                  {it.name}
                </span>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateModal;
