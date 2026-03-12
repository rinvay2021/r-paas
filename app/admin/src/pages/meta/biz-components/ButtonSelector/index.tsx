import React from 'react';
import { Button } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import ButtonSelectorModal from './SettingModal';
import { ActionButtonDto } from '@/api/meta/interface';

interface ButtonSelectorProps {
  value?: ActionButtonDto[];
  onChange?: (buttons: ActionButtonDto[]) => void;
}

const ButtonSelector: React.FC<ButtonSelectorProps> = ({ value, onChange }) => {
  return (
    <ButtonSelectorModal value={value} onChange={onChange}>
      <Button icon={<BgColorsOutlined />} type="link">
        选择按钮
      </Button>
    </ButtonSelectorModal>
  );
};

export default ButtonSelector;
