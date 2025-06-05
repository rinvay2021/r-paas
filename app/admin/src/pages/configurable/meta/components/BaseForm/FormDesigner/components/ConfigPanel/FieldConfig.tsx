import React from 'react';
import { ProForm, ProFormText, ProFormSwitch, ProFormRadio } from '@ant-design/pro-components';
import type { FieldConfigProps } from '../../types';
import FieldSettingsButton from './components/FieldSettingsButton';

export const FieldConfigPanel: React.FC<FieldConfigProps> = props => {
  const { field, onChange } = props;

  return (
    <ProForm layout="vertical" submitter={false} initialValues={field} onValuesChange={onChange}>
      <ProFormText name="label" label="显示名称" placeholder="请输入显示名称" />

      <ProFormSwitch name="required" label="是否必填" />

      <ProFormRadio.Group
        name="createMode"
        label="新建时"
        options={[
          { label: '可编辑', value: 'editable' },
          { label: '只读', value: 'readonly' },
          { label: '隐藏', value: 'hidden' },
        ]}
      />
      <ProFormRadio.Group
        name="editMode"
        label="编辑时"
        options={[
          { label: '可编辑', value: 'editable' },
          { label: '只读', value: 'readonly' },
          { label: '隐藏', value: 'hidden' },
        ]}
      />
      <ProFormRadio.Group
        name="viewMode"
        label="查看时"
        options={[
          { label: '可编辑', value: 'editable' },
          { label: '只读', value: 'readonly' },
          { label: '隐藏', value: 'hidden' },
        ]}
      />

      <ProFormText name="placeholder" label="提示语" placeholder="请输入提示语" />

      <ProFormText name="tooltip" label="显示帮助" placeholder="请输入显示帮助" />

      <ProForm.Item name="extraConfig" label="更多设置">
        <FieldSettingsButton />
      </ProForm.Item>
    </ProForm>
  );
};
