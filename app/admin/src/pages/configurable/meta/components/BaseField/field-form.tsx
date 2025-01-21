import React from 'react';
import { map } from 'lodash';
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
import { FIELD_TYPE_GROUPS, useCommonConfigs, TYPE_CONFIGS, JSON_CONFIG } from './constant';
import { FieldConfigItem, FieldModalProps, FieldTypeEnum } from './type';
import { metaService } from '@/api/meta';

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

  const { run: fetchField } = useRequest(metaService.getFieldById, {
    manual: true,
    onSuccess: resp => {
      // console.log('resp ====', resp.data);
      setActiveTab(resp?.data?.fieldType);
      formInstance?.current?.setFieldsValue(resp?.data);
    },
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
    // 如果弹窗关闭，则清空表单
    if (!visible) {
      formInstance?.current?.resetFields();
      return;
    }

    // 如果弹窗打开，则根据id获取字段信息 或者设置默认类型
    if (id) {
      fetchField(id);
    } else {
      // 设置默认类型
      formInstance?.current?.setFieldsValue({
        fieldType: FieldTypeEnum.Text,
      });
    }
  }, [id, visible]);

  // 是否是编辑
  const isEdit = Boolean(id);
  // 公共配置
  const commonConfigs = useCommonConfigs(isEdit);
  // 各个类型独有的配置
  const configs = TYPE_CONFIGS[activeTab]?.properties;

  return (
    <ModalForm
      open={visible}
      title={isEdit ? '编辑字段' : '新建字段'}
      formRef={formInstance}
      onOpenChange={onVisibleChange}
      modalProps={{
        destroyOnClose: true,
      }}
      onFinish={async values => {
        let result;

        if (isEdit) {
          result = await metaService.updateField({
            ...values,
            _id: id,
          });
        } else {
          result = await metaService.createField({
            ...values,
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
          {/* JSON配置 */}
          {renderFormItems(JSON_CONFIG)}
        </div>
      </div>
    </ModalForm>
  );
};

export default FiledModal;
