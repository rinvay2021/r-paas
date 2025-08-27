import React from 'react';
import { ProForm } from '@ant-design/pro-components';
import HelpSettingsButton from '@/pages/meta/biz-components/HelpSettingsButton';

import type { DetailPageConfigProps } from '../../types';

const ConfigPanel: React.FC<DetailPageConfigProps> = props => {
  const { config, onChange } = props;

  return (
    <ProForm layout="horizontal" submitter={false} initialValues={config} onValuesChange={onChange}>
      <ProForm.Item name="helpSettings" tooltip="配置表单帮助" label="帮助设置">
        <HelpSettingsButton />
      </ProForm.Item>
    </ProForm>
  );
};

export default ConfigPanel;
