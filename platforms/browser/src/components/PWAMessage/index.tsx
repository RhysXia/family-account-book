import { Button, notification, Space } from 'antd';
import { FC, useEffect } from 'react';
import { RegisterSWOptions, useRegisterSW } from 'virtual:pwa-register/react';

const key = 'upgrade';

const PWAMessage: FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW,
    onRegisterError,
  });

  const [instance, holder] = notification.useNotification();

  useEffect(() => {
    if (!needRefresh) {
      return;
    }

    const btn = (
      <Space>
        <Button
          type="link"
          size="small"
          onClick={() => {
            notification.close(key);
          }}
        >
          暂不更新
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setNeedRefresh(false);
            notification.close(key);
            updateServiceWorker(true);
          }}
        >
          更新
        </Button>
      </Space>
    );

    instance.info({
      key,
      duration: 0,
      message: '更新',
      description: '发现新版本，是否更新',
      btn,
    });
  }, [needRefresh, instance, updateServiceWorker, setNeedRefresh]);

  return holder;
};

export default PWAMessage;

const onRegisteredSW: RegisterSWOptions['onRegisteredSW'] = (
  swScriptUrl,
  registration,
) => {
  console.log('SW Registered: ', swScriptUrl, registration);
};
const onRegisterError: RegisterSWOptions['onRegisterError'] = (error) => {
  console.error('SW registration error', error);
};
