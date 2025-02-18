import React from 'react';
import { ProForm, ProFormRadio, ProFormText } from '@ant-design/pro-components';
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
    </ProForm>
  );
};
