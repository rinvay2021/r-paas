import React from 'react';
import { Button, Modal } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { ProForm, ProFormRadio, ProFormSwitch, ProFormText } from '@ant-design/pro-components';

interface LayoutSettings {
  /** 标题 */
  title?: string;
  /** 标签对齐 */
  labelAlign?: 'left' | 'right';
  /** 布局方式 */
  layout?: 'horizontal' | 'vertical' | 'inline';
  /** 表单尺寸 */
  size?: 'small' | 'middle' | 'large';
  /** 变体样式 */
  variant?: 'outlined' | 'filled' | 'borderless';
  /** 是否显示冒号 */
  colon?: boolean;
  /** 标签是否换行 */
  labelWrap?: boolean;
}

interface LayoutSettingsButtonProps {
  value?: LayoutSettings;
  onChange?: (values: LayoutSettings) => void;
}

const LayoutSettingsButton: React.FC<LayoutSettingsButtonProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [formValues, setFormValues] = React.useState<LayoutSettings>(value);

  const handleOk = () => {
    onChange?.(formValues);
    setOpen(false);
  };

  const handleCancel = () => {
    setFormValues(value);
    setOpen(false);
  };

  const handleValuesChange = (_: LayoutSettings, allValues: LayoutSettings) => {
    setFormValues(allValues);
  };

  return (
    <>
      <Button icon={<SettingOutlined />} type="link" onClick={() => setOpen(true)}>
        点击设置
      </Button>
      <Modal title="布局设置" open={open} onOk={handleOk} onCancel={handleCancel} width={800}>
        <ProForm
          size="large"
          layout="vertical"
          submitter={false}
          initialValues={value}
          onValuesChange={handleValuesChange}
        >
          <ProFormText name="title" label="标题" placeholder="请输入表单标题" />
          <ProFormRadio.Group
            name="labelAlign"
            label="标签对齐"
            options={[
              { label: '左对齐', value: 'left' },
              { label: '右对齐', value: 'right' },
            ]}
          />

          <ProFormRadio.Group
            name="layout"
            label="布局方式"
            options={[
              { label: '水平', value: 'horizontal' },
              { label: '垂直', value: 'vertical' },
              { label: '行内', value: 'inline' },
            ]}
          />

          <ProFormRadio.Group
            name="size"
            label="表单尺寸"
            options={[
              { label: '小', value: 'small' },
              { label: '中', value: 'middle' },
              { label: '大', value: 'large' },
            ]}
          />

          <ProFormRadio.Group
            name="variant"
            label="变体样式"
            options={[
              { label: '描边', value: 'outlined' },
              { label: '填充', value: 'filled' },
              { label: '无边框', value: 'borderless' },
            ]}
          />

          <ProFormSwitch name="colon" label="是否显示冒号" />
          <ProFormSwitch name="labelWrap" label="标签是否换行" />
        </ProForm>
      </Modal>
    </>
  );
};

export default LayoutSettingsButton;
