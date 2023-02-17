import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register';
import { Button, notification, Space } from 'antd';

const key = 'upgrade';

const updateSW = registerSW({
  onNeedRefresh() {
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
            notification.close(key);
            updateSW(true);
          }}
        >
          更新
        </Button>
      </Space>
    );

    notification.warning({
      key,
      duration: 0,
      message: '更新',
      description: '发现新版本，是否更新',
      btn,
    });
  },
  onOfflineReady() {
    console.log('Offline ready');
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />,
);
