import React from 'react';
import type { MouseEvent } from 'react';
import { Form, Modal, Select, Input } from 'antd';
import { includes } from 'lodash';

import { defaultValue, HELP_TYPE_OPTIONS, TIP_TYPE_OPTIONS } from './constant';
import { HelpSettingsProps, HelpSettingsValue, HelpType } from './type';

const HelpSettings: React.FC<HelpSettingsProps> = ({
  children,
  value,
  onChange,
  modalTitle = '帮助设置',
  triggerProps,
}) => {
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm<HelpSettingsValue>();

  const initialFormValue = React.useMemo<HelpSettingsValue>(
    () => ({ ...defaultValue, ...value }),
    [value]
  );

  const handleTriggerClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    form.setFieldsValue(initialFormValue);
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleOk = async () => {
    form.submit();
  };

  const onFinish = (values: HelpSettingsValue) => {
    onChange?.(values);
    setOpen(false);
  };

  const tipType = Form.useWatch('tipType', form) as HelpType[];

  const showTooltip = includes(tipType, HelpType.TOOLTIP);
  const showLink = includes(tipType, HelpType.LINK);

  return (
    <>
      <span onClick={handleTriggerClick} {...(triggerProps as any)}>
        {children}
      </span>

      <Modal open={open} onCancel={handleCancel} onOk={handleOk} title={modalTitle} destroyOnClose>
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          initialValues={initialFormValue}
          preserve={false}
        >
          <Form.Item name="type" label="提示类型">
            <Select options={TIP_TYPE_OPTIONS} placeholder="请选择提示类型" />
          </Form.Item>

          <Form.Item name="tipType" label="帮助类型">
            <Select mode="multiple" options={HELP_TYPE_OPTIONS} placeholder="请选择帮助类型" />
          </Form.Item>

          {showTooltip && (
            <Form.Item
              name="tooltip"
              label="帮助提示"
              rules={[{ required: true, message: '请输入帮助提示' }]}
            >
              <Input.TextArea placeholder="请输入提示内容" rows={3} />
            </Form.Item>
          )}

          {showLink && (
            <>
              <Form.Item
                name="linkUrl"
                label="帮助链接"
                rules={[
                  { required: true, message: '请选择“链接”时需填写帮助链接' },
                  { type: 'url', message: '请输入合法的链接' },
                ]}
              >
                <Input placeholder="https://example.com/help" />
              </Form.Item>

              <Form.Item name="linkText" label="帮助文字链接">
                <Input placeholder="如：查看帮助文档" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default HelpSettings;
