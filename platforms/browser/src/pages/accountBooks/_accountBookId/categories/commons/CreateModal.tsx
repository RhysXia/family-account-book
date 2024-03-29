import { CreateCategoryInput, useCreateCategory } from '@/graphql/category';
import { activeAccountBookAtom } from '@/store';
import { CategoryTypes, CategoryTypeInfoMap } from '@/utils/constants';
import { Modal, Form, Input, Select, Tag } from 'antd';
import { useAtom } from 'jotai';
import { FC, useCallback } from 'react';

export type CreateModalProps = {
  visible: boolean;
  onChange: (v: boolean) => void;
};

const CreateModal: FC<CreateModalProps> = ({ visible, onChange }) => {
  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [form] = Form.useForm<Omit<CreateCategoryInput, 'accountBookId'>>();
  const [createCategory] = useCreateCategory();

  const handleOk = useCallback(async () => {
    await form.validateFields();
    await createCategory({
      variables: {
        category: {
          ...form.getFieldsValue(),
          accountBookId: activeAccountBook!.id,
        },
      },
    });

    onChange(false);

    form.resetFields();
  }, [form, onChange, activeAccountBook, createCategory]);

  const handleCancel = useCallback(() => {
    onChange(false);
    form.resetFields();
  }, [form, onChange]);

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
          <Input placeholder="请输入名称" />
        </Form.Item>
        <Form.Item
          label="用途"
          name="type"
          rules={[{ required: true, message: '用途不能为空' }]}
        >
          <Select placeholder="请选择用途">
            {CategoryTypes.map((type) => {
              return (
                <Select.Option key={type} value={type}>
                  <Tag color={CategoryTypeInfoMap[type].color}>
                    {CategoryTypeInfoMap[type].text}
                  </Tag>
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item label="描述" name="desc">
          <Input.TextArea placeholder="请输入描述" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateModal;
