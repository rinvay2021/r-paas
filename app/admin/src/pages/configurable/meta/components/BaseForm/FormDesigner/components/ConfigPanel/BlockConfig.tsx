import React from 'react';
import { ProForm, ProFormRadio, ProFormSwitch, ProFormText } from '@ant-design/pro-components';
import type { FormBlockConfig } from '../../types';

export const BlockConfigPanel: React.FC<FormBlockConfig> = props => {
  const { container, onChange } = props;

  return (
    <ProForm
      layout="vertical"
      submitter={false}
      initialValues={container}
      onValuesChange={onChange}
    >
      <ProFormText name="title" label="区块名称" placeholder="请输入区块名称" />

      <ProFormRadio.Group
        name="columns"
        label="显示列数"
        radioType="button"
        options={[
          { label: '单列', value: 1 },
          { label: '双列', value: 2 },
          { label: '三列', value: 3 },
        ]}
      />

      <ProFormRadio.Group
        name="createMode"
        label="新建时"
        radioType="button"
        options={[
          { label: '可编辑', value: 'editable' },
          { label: '只读', value: 'readonly' },
          { label: '隐藏', value: 'hidden' },
        ]}
      />

      <ProFormRadio.Group
        name="editMode"
        label="编辑时"
        radioType="button"
        options={[
          { label: '可编辑', value: 'editable' },
          { label: '只读', value: 'readonly' },
          { label: '隐藏', value: 'hidden' },
        ]}
      />

      <ProFormRadio.Group
        name="viewMode"
        label="查看时"
        radioType="button"
        options={[
          { label: '可编辑', value: 'editable' },
          { label: '只读', value: 'readonly' },
          { label: '隐藏', value: 'hidden' },
        ]}
      />

      <ProFormSwitch name="isHidden" label="是否隐藏区块" />
    </ProForm>
  );
};
