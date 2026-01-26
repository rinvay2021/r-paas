import React from 'react';
import { Button } from 'antd';
import { GatewayOutlined } from '@ant-design/icons';

const LinkageSettingsButton: React.FC = () => {
  return (
    <Button icon={<GatewayOutlined />} type="link">
      点击设置
    </Button>
  );
};

export default LinkageSettingsButton;
