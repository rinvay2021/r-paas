import React from 'react';
import { Button, Modal } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { ProForm, ProFormSwitch, ProFormRadio, ProFormSelect } from '@ant-design/pro-components';
import { useMetaDetails } from '@/store/metaDetailAtom';

export interface ListFieldConfig {
  /** 是否可链接（详情页生效） */
  linkable?: boolean;
  /** 打开方式 */
  openMode?: 'overlay' | 'newPage' | 'push';
  /** 关联详情页编码 */
  detailPageCode?: string;
}

interface ListFieldSettingsButtonProps {
  value?: ListFieldConfig;
  onChange?: (values: ListFieldConfig) => void;
}

const ListFieldSettingsButton: React.FC<ListFieldSettingsButtonProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const [formValues, setFormValues] = React.useState<ListFieldConfig>(value || {});

  const details = useMetaDetails();

  const detailPageOptions = details.map(d => ({
    label: d.detailPageName,
    value: d.detailPageCode,
  }));

  const handleOk = () => {
    onChange?.(formValues);
    setOpen(false);
  };

  const handleCancel = () => {
    setFormValues(value || {});
    setOpen(false);
  };

  const handleValuesChange = (_: ListFieldConfig, allValues: ListFieldConfig) => {
    setFormValues(allValues);
  };

  return (
    <>
      <Button
        type="text"
        size="small"
        icon={<SettingOutlined />}
        onClick={() => setOpen(true)}
      />
      <Modal
        title="字段设置"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        width={500}
        destroyOnClose
      >
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
            extra="详情页生效：点击字段值跳转到对应详情页"
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

              <ProFormSelect
                required
                name="detailPageCode"
                label="打开的详情页"
                placeholder="请选择详情页"
                options={detailPageOptions}
                rules={[{ required: true, message: '请选择详情页' }]}
                extra={detailPageOptions.length === 0 ? '当前对象暂无详情页配置' : undefined}
              />
            </>
          )}
        </ProForm>
      </Modal>
    </>
  );
};

export default ListFieldSettingsButton;
