import React from 'react';
import { ProForm, ProFormText, ProFormCheckbox, ProFormSwitch } from '@ant-design/pro-components';
import type { FieldConfigProps } from '../../types';

export const FieldConfigPanel: React.FC<FieldConfigProps> = props => {
  const { field, onChange } = props;

  return (
    <ProForm layout="vertical" submitter={false} initialValues={field} onValuesChange={onChange}>
      <ProFormText name="label" label="字段显示名称" placeholder="请输入显示名称" />

      <ProFormCheckbox.Group
        name="displayModes"
        label="以下状态隐藏"
        options={[
          { label: '新建', value: 'create' },
          { label: '编辑', value: 'edit' },
          { label: '查看', value: 'view' },
        ]}
      />

      <ProFormSwitch name="required" label="是否必填" />
    </ProForm>
  );
};
