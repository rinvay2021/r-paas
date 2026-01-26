import React from 'react';
import { ProForm, ProFormDigit, ProFormSwitch } from '@ant-design/pro-components';
import HelpSettingsButton from '@/pages/meta/biz-components/HelpSettingsButton';

import type { ListConfigProps } from '../../types';

const ConfigPanel: React.FC<ListConfigProps> = props => {
  const { config, onChange } = props;

  return (
    <ProForm layout="vertical" submitter={false} initialValues={config} onValuesChange={onChange}>
      <ProFormSwitch name="frozenColumn" label="冻结操作列" />
      <ProFormSwitch name="showActions" label="显示操作列" />
      <ProFormSwitch name="showCheckbox" label="显示勾选框" />
      <ProFormSwitch name="showIndex" label="显示序号" />
      <ProFormDigit name="frozenColumnNum" label="左侧冻结列数量" min={0} max={10} />
      <ProFormDigit name="pageSize" label="每页显示数据" min={1} max={1000} />

      <ProForm.Item name="helpSettings" layout='horizontal' tooltip="配置表单帮助" label="帮助设置">
        <HelpSettingsButton />
      </ProForm.Item>
    </ProForm>
  );
};

export default ConfigPanel;
