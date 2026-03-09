import React from 'react';
import { map } from 'lodash';
import { useRequest } from 'ahooks';
import { message, Row, Col } from 'antd';
import type { FormInstance } from 'antd/es/form';
import {
  ProFormText,
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
  ProFormSwitch,
  ModalForm,
} from '@ant-design/pro-components';
import {
  useCommonConfigs,
  HELP_SETTINGS_CONFIGS,
  BUTTON_LEVEL_CONFIG,
  BUTTON_EVENT_TYPE_CONFIG,
  JSON_CONFIG,
  getButtonEventOptionsByLevel,
} from '../constant';
import { ButtonConfigItem, ButtonModalProps, ButtonEventType } from '../type';
import { metaService } from '@/api/meta';

const ComponentMap = {
  ProFormText,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormTextArea,
  'ProFormRadio.Group': () => null,
};

const ButtonModal: React.FC<ButtonModalProps> = params => {
  const { id, appCode, metaObjectCode, visible, onVisibleChange, onFinish } = params;

  const formInstance = React.useRef<FormInstance>();
  const [, forceUpdate] = React.useState({});

  // 是否是编辑
  const isEdit = Boolean(id);
  // 公共配置
  const commonConfigs = useCommonConfigs(isEdit);

  // 编辑时获取按钮信息
  useRequest(() => metaService.getActionButtonById?.(id) || Promise.resolve({ data: {} }), {
    manual: false,
    onSuccess: resp => {
      formInstance?.current?.setFieldsValue(resp?.data);
    },
    ready: isEdit,
  });

  const handleFormValuesChange = (changedValues, allValues) => {
    // 当级别变化时，重置事件类型和事件字段
    if (changedValues.buttonLevel) {
      formInstance?.current?.setFieldsValue({
        buttonEventType: undefined,
        buttonEvent: undefined,
      });
    }
    // 当事件类型变化时，重置事件字段
    if (changedValues.buttonEventType) {
      formInstance?.current?.setFieldsValue({
        buttonEvent: undefined,
      });
    }
    // 触发重新渲染以显示/隐藏动态字段
    forceUpdate({});
  };

  const renderFormItems = (configs: ButtonConfigItem[]) => {
    return map(configs, config => {
      const Component = ComponentMap[config.type];
      if (!Component) return null;

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

  const renderButtonEventField = () => {
    const buttonLevel = formInstance?.current?.getFieldValue('buttonLevel');
    const buttonEventType = formInstance?.current?.getFieldValue('buttonEventType');

    if (!buttonLevel || !buttonEventType) return null;

    if (buttonEventType === ButtonEventType.System) {
      // 系统事件 - 下拉单选
      const eventOptions = getButtonEventOptionsByLevel(buttonLevel);

      return (
        <ProFormSelect
          key="buttonEvent"
          name="buttonEvent"
          label="事件"
          placeholder="请选择事件"
          options={eventOptions}
          rules={[{ required: true, message: '请选择事件' }]}
        />
      );
    } else {
      // 自定义事件 - 文本输入框
      return (
        <ProFormText
          key="buttonEvent"
          name="buttonEvent"
          label="事件"
          placeholder="请输入自定义事件名称"
          rules={[{ required: true, message: '请输入自定义事件名称' }]}
        />
      );
    }
  };

  const renderTwoColumnLayout = (configs: ButtonConfigItem[]) => {
    const items = renderFormItems(configs);
    if (!items || items.length === 0) return null;

    return (
      <Row gutter={[16, 0]}>
        {items.map((item, index) => (
          <Col key={index} xs={24} sm={24} md={12}>
            {item}
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <ModalForm
      open={visible}
      title={isEdit ? '编辑功能按钮' : '新建功能按钮'}
      formRef={formInstance}
      onOpenChange={onVisibleChange}
      modalProps={{
        destroyOnClose: true,
      }}
      onValuesChange={handleFormValuesChange}
      onFinish={async values => {
        let result;

        // 处理 buttonConfig - 如果是字符串则转换为对象
        const formData = {
          ...values,
          buttonConfig: values.buttonConfig
            ? typeof values.buttonConfig === 'string'
              ? JSON.parse(values.buttonConfig)
              : values.buttonConfig
            : undefined,
        };

        if (isEdit) {
          result = await metaService.updateActionButton?.({
            ...formData,
            _id: id,
          });
        } else {
          result = await metaService.createActionButton?.({
            ...formData,
            appCode,
            metaObjectCode,
          });
        }

        message.success(result?.message);
        // 保存回调
        onFinish?.(result?.data);
        return true;
      }}
    >
      {/* 基础配置 - 两列布局 */}
      {renderTwoColumnLayout(commonConfigs)}

      {/* 帮助设置 - 两列布局 */}
      {renderTwoColumnLayout(HELP_SETTINGS_CONFIGS)}

      {/* 按钮级别和事件类型 - 两列布局 */}
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={24} md={12}>
          {renderFormItems(BUTTON_LEVEL_CONFIG)}
        </Col>
        <Col xs={24} sm={24} md={12}>
          {renderFormItems(BUTTON_EVENT_TYPE_CONFIG)}
        </Col>
      </Row>

      {/* 事件 - 动态渲染 */}
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={24} md={12}>
          {renderButtonEventField()}
        </Col>
      </Row>

      {/* JSON配置 - 全宽 */}
      {renderFormItems(JSON_CONFIG)}
    </ModalForm>
  );
};

export default ButtonModal;
