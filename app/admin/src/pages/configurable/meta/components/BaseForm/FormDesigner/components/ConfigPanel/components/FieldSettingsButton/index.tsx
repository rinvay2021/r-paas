import React from 'react';
import { Button, Modal } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormSwitch,
  ProFormRadio,
  ProFormText,
  ProFormSelect,
} from '@ant-design/pro-components';

interface FormFieldSettings {
  /** 默认生效范围 */
  defaultScopes?: string[];
  /** 必填 */
  required?: boolean;
  /** 是否可链接 */
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
      <Modal title="字段设置" open={open} onOk={handleOk} onCancel={handleCancel} width={800}>
        <ProForm
          size="large"
          layout="vertical"
          submitter={false}
          initialValues={value}
          onValuesChange={handleValuesChange}
        >
          <ProFormSelect
            required
            mode="multiple"
            name="defaultScopes"
            label="默认生效范围"
            options={[
              { label: '创建态', value: 'create' },
              { label: '编辑态', value: 'edit' },
              { label: '预览态', value: 'view' },
            ]}
            rules={[{ required: true, message: '请选择默认生效范围' }]}
          />

          <ProFormSwitch name="required" label="是否必填" />

          <ProFormSwitch name="linkable" label="是否可链接" />

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
