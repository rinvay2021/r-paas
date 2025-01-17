import React from 'react';
import { map } from 'lodash';
import { Tabs } from 'antd';
import type { FormInstance } from 'antd/es/form';
import {
  ProFormText,
  ProFormRadio,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
  ProFormSwitch,
} from '@ant-design/pro-components';
import { prefix } from '@/constant';
import { FIELD_TYPE_GROUPS, COMMON_CONFIGS, TYPE_CONFIGS, JSON_CONFIG } from './constant';
import { FieldConfigItem, FieldTypeEnum } from './type';

const ComponentMap = {
  ProFormText,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormTextArea,
  'ProFormRadio.Group': ProFormRadio.Group,
};

const FieldForm: React.FC<{
  formInstance: React.RefObject<FormInstance>;
}> = ({ formInstance }) => {
  const [activeTab, setActiveTab]: [FieldTypeEnum, (key: FieldTypeEnum) => void] =
    React.useState<FieldTypeEnum>();

  const handleTabChange = (newTab: FieldTypeEnum) => {
    formInstance?.current?.resetFields();

    // 设置类型
    setActiveTab(newTab);
    formInstance?.current?.setFieldsValue({
      fieldType: newTab,
    });
  };

  const renderFormItems = (configs: FieldConfigItem[]) => {
    return map(configs, config => {
      const Component = ComponentMap[config.type];
      return (
        <Component
          key={config.name}
          name={config.name}
          label={config.label}
          tooltip={config.tooltip}
          {...config['x-component-props']}
        />
      );
    });
  };

  React.useEffect(() => {
    // 设置默认类型
    setActiveTab(FieldTypeEnum.Text);
    formInstance?.current?.setFieldsValue({
      fieldType: FieldTypeEnum.Text,
    });
  }, []);

  const specConfig = TYPE_CONFIGS[activeTab]?.properties;

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Tabs
        type="line"
        tabPosition="left"
        activeKey={activeTab}
        onChange={handleTabChange}
        className={`${prefix}-field-tabs`}
        items={map(FIELD_TYPE_GROUPS, item => ({
          key: item.type,
          label: item.label,
          children: null,
        }))}
      />

      <div style={{ flex: 1 }}>
        {/* 类型 */}
        <ProFormText label="类型" name="fieldType" hidden />
        {/* 获取公共配置 */}
        {renderFormItems(COMMON_CONFIGS)}
        {/* 获取类型独有配置 */}
        {specConfig && renderFormItems(specConfig)}
        {/* JSON配置 */}
        {renderFormItems(JSON_CONFIG)}
      </div>
    </div>
  );
};

export default FieldForm;
