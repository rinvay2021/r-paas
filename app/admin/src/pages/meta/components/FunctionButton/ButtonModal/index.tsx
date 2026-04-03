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
import { ButtonConfigItem, ButtonModalProps, ButtonEventType, ButtonEvent } from '../type';
import { metaService } from '@/api/meta';

const ComponentMap = {
  ProFormText,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormTextArea,
  'ProFormRadio.Group': () => null,
};

/** 需要配置表单的事件 */
const FORM_REQUIRED_EVENTS = [ButtonEvent.Create, ButtonEvent.Update];

const ButtonModal: React.FC<ButtonModalProps> = params => {
  const { id, appCode, metaObjectCode, visible, onVisibleChange, onFinish } = params;

  const formInstance = React.useRef<FormInstance>();
  const [, forceUpdate] = React.useState({});

  const isEdit = Boolean(id);
  const commonConfigs = useCommonConfigs(isEdit);

  // 加载当前 metaObject 下的表单列表
  const { data: formsData } = useRequest(
    () => metaService.queryForms({ appCode, metaObjectCode }),
    { ready: !!(appCode && metaObjectCode) },
  );
  const formOptions = (formsData?.data?.list || []).map(f => ({
    label: f.formName,
    value: f.formCode,
  }));

  // 编辑时回填数据
  useRequest(() => metaService.getActionButtonById?.(id) || Promise.resolve({ data: {} }), {
    manual: false,
    onSuccess: resp => {
      const data = resp?.data || {};
      // buttonConfig 是对象，回填时把 form 字段单独提取到 _formCode 虚拟字段
      formInstance?.current?.setFieldsValue({
        ...data,
        _formCode: data.buttonConfig?.formCode,
        buttonConfig: data.buttonConfig ? JSON.stringify(data.buttonConfig, null, 2) : undefined,
      });
    },
    ready: isEdit,
  });

  const handleFormValuesChange = (changedValues: any) => {
    if (changedValues.buttonLevel) {
      formInstance?.current?.setFieldsValue({
        buttonEventType: undefined,
        buttonEvent: undefined,
        _formCode: undefined,
      });
    }
    if (changedValues.buttonEventType) {
      formInstance?.current?.setFieldsValue({
        buttonEvent: undefined,
        _formCode: undefined,
      });
    }
    if (changedValues.buttonEvent) {
      formInstance?.current?.setFieldsValue({ _formCode: undefined });
    }
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

  /** 根据当前事件动态渲染按钮级别属性配置 */
  const renderEventConfig = () => {
    const buttonEvent = formInstance?.current?.getFieldValue('buttonEvent');
    const buttonEventType = formInstance?.current?.getFieldValue('buttonEventType');

    if (buttonEventType !== ButtonEventType.System) return null;
    if (!buttonEvent || !FORM_REQUIRED_EVENTS.includes(buttonEvent)) return null;

    return (
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={24} md={12}>
          <ProFormSelect
            name="_formCode"
            label="关联表单"
            tooltip="选择该按钮操作的表单，用于新建/编辑场景"
            placeholder="请选择关联表单"
            options={formOptions}
            rules={[{ required: true, message: '请选择关联表单' }]}
          />
        </Col>
      </Row>
    );
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
      modalProps={{ destroyOnClose: true }}
      onValuesChange={handleFormValuesChange}
      onFinish={async values => {
        // 把 _formCode 合并进 buttonConfig.form，_formCode 不上传
        const { _formCode, buttonConfig: rawConfig, ...rest } = values;

        let parsedConfig: Record<string, any> = {};
        if (rawConfig) {
          try {
            parsedConfig = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
          } catch {
            message.error('扩展配置 JSON 格式有误');
            return false;
          }
        }
        if (_formCode) {
          parsedConfig.formCode = _formCode;
        }

        const formData = {
          ...rest,
          buttonConfig: Object.keys(parsedConfig).length ? parsedConfig : undefined,
        };

        let result;
        if (isEdit) {
          result = await metaService.updateActionButton?.({ ...formData, _id: id });
        } else {
          result = await metaService.createActionButton?.({ ...formData, appCode, metaObjectCode });
        }

        message.success(result?.message);
        onFinish?.(result?.data);
        return true;
      }}
    >
      {/* 基础配置 */}
      {renderTwoColumnLayout(commonConfigs)}

      {/* 帮助设置 */}
      {renderTwoColumnLayout(HELP_SETTINGS_CONFIGS)}

      {/* 按钮级别 + 事件类型 */}
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={24} md={12}>
          {renderFormItems(BUTTON_LEVEL_CONFIG)}
        </Col>
        <Col xs={24} sm={24} md={12}>
          {renderFormItems(BUTTON_EVENT_TYPE_CONFIG)}
        </Col>
      </Row>

      {/* 事件 */}
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={24} md={12}>
          {renderButtonEventField()}
        </Col>
      </Row>

      {/* 事件级别属性（关联表单等） */}
      {renderEventConfig()}

      {/* 扩展 JSON 配置 */}
      {renderFormItems(JSON_CONFIG)}
    </ModalForm>
  );
};

export default ButtonModal;
