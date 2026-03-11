import React from 'react';
import { ProForm } from '@ant-design/pro-components';
import HelpSettingsButton from '@/pages/meta/biz-components/HelpSettings';

import type { FormConfigProps } from '../../types';

import LayoutSettingsButton from './components/LayoutSettingsButton';
import LinkageSettingsButton from './components/LinkageSettingsButton';

export const FormConfigPanel: React.FC<FormConfigProps> = props => {
  const { config, onChange } = props;

  return (
    <ProForm layout="horizontal" submitter={false} initialValues={config} onValuesChange={onChange}>
      <ProForm.Item name="helpSettings" tooltip="配置表单帮助" label="帮助设置">
        <HelpSettingsButton />
      </ProForm.Item>
      <ProForm.Item name="layoutSettings" tooltip="配置表单布局" label="布局设置">
        <LayoutSettingsButton />
      </ProForm.Item>
      <ProForm.Item name="linkageSettings" tooltip="配置表单字段联动" label="联动设置">
        <LinkageSettingsButton />
      </ProForm.Item>
    </ProForm>
  );
};
