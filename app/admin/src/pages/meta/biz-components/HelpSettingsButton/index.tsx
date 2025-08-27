import React from 'react';
import { Button } from 'antd';
import HelpSettings from '@/pages/meta/biz-components/HelpSettings';
import { HelpSettingsValue } from '@/pages/meta/biz-components/HelpSettings/type';

import { QuestionCircleOutlined } from '@ant-design/icons';

interface HelpSettingsButtonProps {
  value?: HelpSettingsValue;
  onChange?: (x: HelpSettingsValue) => void;
}

const HelpSettingsButton: React.FC<HelpSettingsButtonProps> = ({ value, onChange }) => {
  return (
    <HelpSettings value={value} onChange={onChange}>
      <Button icon={<QuestionCircleOutlined />} type="dashed">
        点击设置
      </Button>
    </HelpSettings>
  );
};

export default HelpSettingsButton;
