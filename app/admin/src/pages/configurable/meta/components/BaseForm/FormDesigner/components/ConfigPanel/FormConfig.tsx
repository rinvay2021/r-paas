import React from 'react';
import { ProForm, ProFormRadio, ProFormSwitch, ProFormText } from '@ant-design/pro-components';
import type { FormBaseConfig } from '../../types';

interface FormConfigProps {
  config: FormBaseConfig;
  onChange: (values: Partial<FormBaseConfig>) => void;
}

export const FormConfigPanel: React.FC<FormConfigProps> = props => {
  const { config, onChange } = props;

  return (
    <ProForm layout="vertical" submitter={false} initialValues={config} onValuesChange={onChange}>
      <ProFormText name="title" label="标题" placeholder="请输入表单标题" />

      <ProFormRadio.Group
        name="columns"
        label="默认列数"
        radioType="button"
        options={[
          { label: '单列', value: 1 },
          { label: '双列', value: 2 },
        ]}
      />

      <ProFormRadio.Group
        name="labelAlign"
        label="标签对齐"
        radioType="button"
        options={[
          { label: '左对齐', value: 'left' },
          { label: '右对齐', value: 'right' },
        ]}
      />

      <ProFormRadio.Group
        name="size"
        label="表单尺寸"
        radioType="button"
        options={[
          { label: '小', value: 'small' },
          { label: '中', value: 'middle' },
          { label: '大', value: 'large' },
        ]}
      />

      <ProFormRadio.Group
        name="layout"
        label="布局方式"
        radioType="button"
        options={[
          { label: '水平', value: 'horizontal' },
          { label: '垂直', value: 'vertical' },
          { label: '行内', value: 'inline' },
        ]}
      />

      <ProFormRadio.Group
        name="variant"
        label="变体样式"
        radioType="button"
        options={[
          { label: '描边', value: 'outlined' },
          { label: '无边框', value: 'borderless' },
          { label: '填充', value: 'filled' },
        ]}
      />

      <ProFormSwitch name="colon" label="显示冒号" />
      <ProFormSwitch name="labelWrap" label="标签换行" />
    </ProForm>
  );
};
