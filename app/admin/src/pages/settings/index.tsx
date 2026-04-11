import React from 'react';
import { Tabs, Card } from 'antd';
import { RobotOutlined, CloudUploadOutlined } from '@ant-design/icons';
import AiConfigPanel from './panels/AiConfigPanel';
import OssConfigPanel from './panels/OssConfigPanel';

const SettingsPage: React.FC = () => {
  return (
    <div style={{ height: '100%', background: '#fff', padding: 24, overflowY: 'auto' }}>
      <Tabs
        defaultActiveKey="ai"
        type="card"
        size="middle"
        items={[
          {
            key: 'ai',
            label: (
              <span>
                <RobotOutlined style={{ marginRight: 6 }} />
                AI 配置
              </span>
            ),
            children: <AiConfigPanel />,
          },
          {
            key: 'oss',
            label: (
              <span>
                <CloudUploadOutlined style={{ marginRight: 6 }} />
                OSS 配置
              </span>
            ),
            children: <OssConfigPanel />,
          },
        ]}
      />
    </div>
  );
};

export default SettingsPage;
