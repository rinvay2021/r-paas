import React from 'react';
import { ProForm } from '@ant-design/pro-components';
import HelpSettingsButton from '@/pages/meta/biz-components/HelpSettingsButton';

interface ViewConfigPanelProps {
  config?: any;
  onChange?: (config: any) => void;
}

const ViewConfigPanel: React.FC<ViewConfigPanelProps> = props => {
  const { config, onChange } = props;

  return (
    <ProForm
      layout="horizontal"
      submitter={false}
      initialValues={config}
      onValuesChange={onChange}
    >
      <ProForm.Item name="helpSettings" tooltip="配置视图帮助" label="帮助设置">
        <HelpSettingsButton />
      </ProForm.Item>
    </ProForm>
  );
};

export default ViewConfigPanel;
