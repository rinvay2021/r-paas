import React from 'react';
import { Button } from 'antd';
import HelpSettings from './SettingModal';
import { HelpSettingsValue } from './type';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface HelpSettingsButtonProps {
  value?: HelpSettingsValue;
  onChange?: (x: HelpSettingsValue) => void;
}

const HelpSettingsButton: React.FC<HelpSettingsButtonProps> = ({ value, onChange }) => {
  return (
    <HelpSettings value={value} onChange={onChange}>
      <Button icon={<QuestionCircleOutlined />} type="link">
        点击设置
      </Button>
    </HelpSettings>
  );
};

export default HelpSettingsButton;
