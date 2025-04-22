import React from 'react';
import { Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const HelpSettingsButton: React.FC = () => {
  return (
    <Button icon={<QuestionCircleOutlined />} type="dashed">
      点击设置
    </Button>
  );
};

export default HelpSettingsButton;
