import React from 'react';
import { Button, Modal } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormSwitch,
  ProFormRadio,
  ProFormText,
} from '@ant-design/pro-components';

interface FormFieldSettings {
  /** 是否可链接（详情页生效） */
  linkable?: boolean;
  /** 打开方式 */
  openMode?: 'overlay' | 'newPage' | 'push';
  /** 链接地址 */
  linkUrl?: string;
}

interface FormFieldSettingsButtonProps {
  value?: FormFieldSettings;
  onChange?: (values: FormFieldSettings) => void;
}

const FormFieldSettingsButton: React.FC<FormFieldSettingsButtonProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [formValues, setFormValues] = React.useState<FormFieldSettings>(value || {});

  const handleOk = () => {
    onChange?.(formValues);
    setOpen(false);
  };

  const handleCancel = () => {
    setFormValues(value || {});
    setOpen(false);
  };

  const handleValuesChange = (_: FormFieldSettings, allValues: FormFieldSettings) => {
    setFormValues(allValues);
  };

  return (
    <>
      <Button icon={<QuestionCircleOutlined />} type="dashed" onClick={() => setOpen(true)}>
        点击设置
      </Button>
      <Modal title="字段设置" open={open} onOk={handleOk} onCancel={handleCancel} width={600}>
        <ProForm
          size="large"
          layout="vertical"
          submitter={false}
          initialValues={value}
          onValuesChange={handleValuesChange}
        >
          <ProFormSwitch
            name="linkable"
            label="是否可链接"
            extra="详情页生效：在详情页中字段值将渲染为可点击链接"
          />

          {formValues.linkable && (
            <>
              <ProFormRadio.Group
                required
                name="openMode"
                label="打开方式"
                options={[
                  { label: '当前页面覆盖', value: 'overlay' },
                  { label: '新页面', value: 'newPage' },
                  { label: '当前页面推屏', value: 'push' },
                ]}
                rules={[{ required: true, message: '请选择打开方式' }]}
              />

              <ProFormText
                required
                name="linkUrl"
                label="链接地址"
                placeholder="请输入链接地址"
                rules={[
                  { required: true, message: '请输入链接地址' },
                  { type: 'url', message: '请输入有效的链接地址' },
                ]}
              />
            </>
          )}
        </ProForm>
      </Modal>
    </>
  );
};

export default FormFieldSettingsButton;
