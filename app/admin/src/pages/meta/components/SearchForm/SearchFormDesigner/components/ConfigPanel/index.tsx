import React from 'react';
import { ProForm, ProFormDigit, ProFormSwitch } from '@ant-design/pro-components';
// import HelpSettingsButton from '@/pages/meta/biz-components/HelpSettingsButton';

import type { SearchFormConfigProps, SearchFormConfigRef } from '../../types';

const ConfigPanel: React.ForwardRefRenderFunction<SearchFormConfigRef, SearchFormConfigProps> = (
  props,
  ref
) => {
  const { config } = props;

  const [form] = ProForm.useForm();

  React.useImperativeHandle(ref, () => {
    return {
      getSearchFormConfig: () => form.getFieldsValue?.() || {},
    };
  });

  return (
    <ProForm form={form} submitter={false} initialValues={config} layout="vertical">
      {/* <ProForm.Item name="helpSettings" layout="horizontal" tooltip="配置表单帮助" label="帮助设置">
        <HelpSettingsButton />
      </ProForm.Item> */}

      <ProFormSwitch name="isCollapsible" label="是否可折叠" />
      <ProFormDigit name="collapseRows" label="折叠行数" min={1} max={10} />
    </ProForm>
  );
};

export default React.forwardRef(ConfigPanel);
