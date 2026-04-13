import React from 'react';
import { map, get } from 'lodash';
import { useRequest } from 'ahooks';
import { message, Tabs } from 'antd';
import type { FormInstance } from 'antd/es/form';
import {
  ProFormText,
  ProFormRadio,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
  ProFormSwitch,
  ModalForm,
} from '@ant-design/pro-components';
import { prefix } from '@/constant';
import { FIELD_TYPE_GROUPS, useCommonConfigs, TYPE_CONFIGS, JSON_CONFIG } from '../constant';
import { FieldConfigItem, FieldModalProps, FieldTypeEnum } from '../type';
import { metaService } from '@/api/meta';
import { datasourceService } from '@/api/datasource';

const ComponentMap = {
  ProFormText,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormTextArea,
  'ProFormRadio.Group': ProFormRadio.Group,
};

type ActiveTabState = [FieldTypeEnum, (key: FieldTypeEnum) => void];

const FiledModal: React.FC<FieldModalProps> = params => {
  const { id, appCode, metaObjectCode, visible, onVisibleChange, onFinish } = params;

  const formInstance = React.useRef<FormInstance>();
  const [activeTab, setActiveTab]: ActiveTabState = React.useState<FieldTypeEnum>(
    FieldTypeEnum.Text
  );

  // 是否是编辑
  const isEdit = Boolean(id);
  // 公共配置
  const commonConfigs = useCommonConfigs(isEdit);
  // 各个类型独有的配置
  const configs = TYPE_CONFIGS[activeTab]?.properties;

  // 获取数据源列表
  const { data: datasourceData } = useRequest(
    () => datasourceService.queryDatasources({ appCode, page: 1, pageSize: -1 }),
    {
      ready: !!appCode,
      cacheKey: `datasource-list-${appCode}`,
    }
  );

  const datasourceOptions = React.useMemo(() => {
    const list = get(datasourceData, 'data.list', []);
    return list.map(item => ({
      label: item.datasourceName,
      value: item.datasourceCode,
    }));
  }, [datasourceData]);

  // 编辑时获取字段信息
  useRequest(() => metaService.getFieldById(id), {
    manual: false,
    onSuccess: resp => {
      setActiveTab(resp?.data?.fieldType as any);

      // 设置表单值，确保 config 对象正确展开
      const fieldData = resp?.data;
      let configObj = {};

      // 处理 config 字段
      if (fieldData?.config) {
        if (typeof fieldData.config === 'string') {
          try {
            configObj = JSON.parse(fieldData.config);
          } catch {
            configObj = {};
          }
        } else if (typeof fieldData.config === 'object') {
          configObj = fieldData.config;
        }
      }

      const formValues = {
        ...fieldData,
        // 将 config 对象展开到表单的嵌套字段中
        config: configObj,
        // 同时设置 JSON 配置字段（用于显示和编辑）
        configJson: Object.keys(configObj).length > 0 ? JSON.stringify(configObj, null, 2) : '',
      };

      formInstance?.current?.setFieldsValue(formValues);
    },
    ready: isEdit,
  });

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

      // 如果是数据源字段，注入数据源选项
      const componentProps = { ...config['x-component-props'] };
      const configName = Array.isArray(config.name) ? config.name.join('.') : config.name;
      if (configName === 'config.datasourceCode') {
        componentProps.options = datasourceOptions;
        componentProps.showSearch = true;
        componentProps.filterOption = (input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
      }

      return (
        <Component
          key={configName}
          name={config.name}
          label={config.label}
          tooltip={config.tooltip}
          {...componentProps}
        />
      );
    });
  };

  return (
    <ModalForm
      open={visible}
      title={isEdit ? '编辑字段' : '新建字段'}
      formRef={formInstance}
      onOpenChange={onVisibleChange}
      initialValues={{
        fieldType: FieldTypeEnum.Text,
      }}
      modalProps={{
        destroyOnClose: true,
      }}
      onFinish={async values => {
        let result;

        // 处理配置合并
        const finalValues = { ...values };

        // 如果有 JSON 配置，解析并合并到 config
        if (values.configJson && values.configJson.trim()) {
          try {
            const jsonConfig = JSON.parse(values.configJson);
            // 合并：JSON 配置会覆盖表单配置
            finalValues.config = {
              ...finalValues.config,
              ...jsonConfig,
            };
          } catch (error) {
            message.error('JSON 配置格式错误，请检查');
            return false;
          }
        }

        // 删除临时字段
        delete finalValues.configJson;

        if (isEdit) {
          result = await metaService.updateField({
            ...finalValues,
            _id: id,
          });
        } else {
          result = await metaService.createField({
            ...finalValues,
            appCode,
            metaObjectCode,
          });
        }

        message.success(result?.message);
        // 保存回调
        onFinish?.(result);
        return true;
      }}
    >
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
            disabled: isEdit,
          }))}
        />

        <div style={{ flex: 1 }}>
          {/* 类型 */}
          <ProFormText label="类型" name="fieldType" hidden />
          {renderFormItems(commonConfigs)}
          {configs && renderFormItems(configs)}
          {/* JSON配置（高级） */}
          {renderFormItems(JSON_CONFIG)}
        </div>
      </div>
    </ModalForm>
  );
};

export default FiledModal;
