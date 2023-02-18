import DatePicker from '@/components/DatePicker';
import TagSelect from '@/components/TagSelect';
import { useCreateFlowRecord } from '@/graphql/flowRecord';
import useConstantFn from '@/hooks/useConstanFn';
import { activeAccountBookAtom, currentUserAtom } from '@/store';
import { Category, CategoryType, SavingAccount, Tag, User } from '@/types';
import { CreditCardOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  FormRule,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAtom } from 'jotai';
import { FC, useCallback, useMemo } from 'react';

export type CreateModelProps = {
  visible: boolean;
  tags: Array<Tag & { category: Category }>;
  savingAccounts: Array<SavingAccount>;
  onChange: (v: boolean) => void;
  onRefrshSavingAccounts: () => Promise<void>;
  users: Array<User>;
};

const CreateModel: FC<CreateModelProps> = ({
  visible,
  tags,
  savingAccounts,
  onChange,
  onRefrshSavingAccounts,
  users,
}) => {
  const [createFlowRecord] = useCreateFlowRecord();

  const [activeAccountBook] = useAtom(activeAccountBookAtom);

  const [currentUser] = useAtom(currentUserAtom);

  // currentUser的id不符合要求
  const normalizedCurrentUser = useMemo(() => {
    return users.find((it) => it.username === currentUser?.username);
  }, [users, currentUser]);

  const [form] = Form.useForm<{
    amount: number;
    dealAt: Dayjs;
    desc: string;
    savingAccountId: string;
    tagId: string;
    traderId: string;
  }>();

  const handleCreate = useCallback(async () => {
    const { amount, dealAt, desc, savingAccountId, tagId, traderId } =
      await form.validateFields();

    const selectedTag = tags.find((it) => it.id === tagId);

    const categoryType = selectedTag?.category.type;

    await createFlowRecord({
      variables: {
        flowRecord: {
          amount: categoryType === CategoryType.EXPENDITURE ? -amount : amount,
          desc,
          savingAccountId,
          tagId,
          dealAt: dealAt.format('YYYY-MM-DD'),
          traderId,
        },
      },
    });

    // 不清空不经常修改的字段，方便快速输入
    form.setFieldValue('amount', undefined);
    form.setFieldValue('desc', undefined);

    message.success('添加成功');
    await onRefrshSavingAccounts();
  }, [form, createFlowRecord, onRefrshSavingAccounts, tags]);

  const handleClose = useConstantFn(async () => {
    onChange(false);
    // 关闭的时候，清空
    form.resetFields();
  });

  const handleCreateAndClose = useCallback(async () => {
    await handleCreate();
    await handleClose();
  }, [handleCreate, handleClose]);

  return (
    <Modal
      visible={visible}
      onCancel={handleClose}
      title="添加流水"
      footer={
        <>
          <Button onClick={handleClose}>取消</Button>
          <Button type="primary" onClick={handleCreate}>
            保存并继续
          </Button>
          <Button type="primary" onClick={handleCreateAndClose}>
            保存并关闭
          </Button>
        </>
      }
    >
      <Form
        labelCol={{
          span: 4,
        }}
        form={form}
        initialValues={{
          traderId: normalizedCurrentUser?.id,
          dealAt: dayjs(),
        }}
      >
        <Form.Item
          label="标签"
          name="tagId"
          rules={[{ required: true, message: '标签不能为空' }]}
        >
          <TagSelect accountBookId={activeAccountBook!.id} />
        </Form.Item>
        <Form.Item noStyle={true} dependencies={['tagId']}>
          {({ getFieldValue }) => {
            const selectTagId = getFieldValue('tagId');
            const tag = tags.find((it) => it.id === selectTagId);

            const categoryType = tag?.category.type;

            const amountPrefix =
              categoryType === CategoryType.EXPENDITURE ? '-' : '';

            return (
              <Form.Item
                label="金额"
                dependencies={['tagId']}
                rules={
                  [
                    { required: true, message: '金额不能为空' },
                    categoryType &&
                      categoryType !== CategoryType.UNKNOWN && {
                        type: 'number',
                        min: 0.01,
                        message: '金额不能为负',
                      },
                  ].filter(Boolean) as Array<FormRule>
                }
                name="amount"
              >
                <InputNumber
                  disabled={!tag}
                  prefix={amountPrefix}
                  className="w-full"
                  placeholder={tag ? '请输入金额' : '请先选择标签'}
                />
              </Form.Item>
            );
          }}
        </Form.Item>
        <Form.Item
          label="账户"
          name="savingAccountId"
          rules={[{ required: true, message: '账本不能为空' }]}
        >
          <Select>
            {savingAccounts.map((it) => {
              return (
                <Select.Option value={it.id} key={it.id}>
                  <span className="flex items-center">
                    <CreditCardOutlined />
                    <span className="pl-2">
                      {it.name}(¥{it.amount})
                    </span>
                  </span>
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item
          label="交易时间"
          name="dealAt"
          rules={[{ required: true, message: '交易时间不能为空' }]}
        >
          <DatePicker className="w-full" clearIcon={false} />
        </Form.Item>
        <Form.Item
          label="交易人员"
          name="traderId"
          rules={[{ required: true, message: '交易人员不能为空' }]}
        >
          <Select className="w-full">
            {users.map((it) => {
              return (
                <Select.Option value={it.id} key={it.id}>
                  <span className="flex items-center">{it.nickname}</span>
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item label="描述" name="desc">
          <Input.TextArea autoSize={{ minRows: 3 }} placeholder="请输入描述" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateModel;
