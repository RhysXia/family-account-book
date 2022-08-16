import { gql, useMutation } from '@apollo/client';
import { Form, Input, Checkbox, Button, message } from 'antd';
import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { currentUserAtom } from '../../store';
import { User } from '../../types';

type FormType = {
  username: string;
  password: string;
  rememberMe?: boolean;
};

const SIGN_IN = gql`
  mutation ($username: String!, $password: String!, $rememberMe: Boolean) {
    signIn(
      user: {
        username: $username
        password: $password
        rememberMe: $rememberMe
      }
    ) {
      id
      username
      email
      createdAt
      updatedAt
      avatar
    }
  }
`;

const LoginPage = () => {
  const [form] = Form.useForm<FormType>();
  const [signIn] = useMutation<{ signIn: User }>(SIGN_IN);

  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);

  const handleFinish = useCallback(
    async (value: FormType) => {
      try {
        const { data } = await signIn({
          variables: value,
        });
        setCurrentUser(data!.signIn);
      } catch (err) {
        message.error((err as Error).message);
      }
    },
    [signIn, setCurrentUser],
  );

  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-yellow-400 to-pink-500">
      <div className="max-w-md w-full">
        <div className="shadow rounded-md py-9 px-9 space-y-4 my-8 bg-gray-100 bg-opacity-25">
          <h2 className="text-center text-3xl text-gray-900">登录</h2>
          <Form layout="vertical" form={form} onFinish={handleFinish}>
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '用户名不能为空' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '密码不能为空' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item name="rememberMe" valuePropName="checked">
              <Checkbox>记住我</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button block type="primary" htmlType="submit">
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
