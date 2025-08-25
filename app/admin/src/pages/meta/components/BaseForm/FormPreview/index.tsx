import React from 'react';
import { Button, Form, Input, Popconfirm, Space } from 'antd';
import { DeleteOutlined, EditOutlined, SettingOutlined } from '@ant-design/icons';
import { prefix } from '@/constant';
import { useElementHeight } from '@/hooks';
import './index.less';

interface PreviewFormProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onSetting?: () => void;
}

const PreviewForm: React.FC<PreviewFormProps> = props => {
  const { onEdit, onDelete, onSetting } = props;
  const previewHeight = useElementHeight({ elementId: 'form-container', offset: 70 });

  return (
    <div
      id="form-preview"
      style={{ height: `${previewHeight}px` }}
      className={`${prefix}-preview-container`}
    >
      {/* 左侧操作按钮 */}
      <Space direction="vertical" size="middle" className={`${prefix}-action-buttons`}>
        <Button shape="circle" icon={<EditOutlined />} size="large" onClick={onEdit} />
        <Button shape="circle" icon={<SettingOutlined />} size="large" onClick={onSetting} />
        <Popconfirm
          title="确定要删除吗？"
          onConfirm={onDelete}
          okText="确定"
          cancelText="取消"
          placement="bottom"
        >
          <Button shape="circle" icon={<DeleteOutlined />} size="large" />
        </Popconfirm>
      </Space>

      {/* 表单内容区域 */}
      {/* TODO：后续替换真实的表单渲染控件 */}
      <div className={`${prefix}-form-content`}>
        <Form className={`${prefix}-form`} layout="vertical">
          {/* 模拟一些表单项来测试滚动 */}
          {Array.from({ length: 20 }, (_, index) => (
            <Form.Item key={index} label={`表单项 ${index + 1}`} required={index % 3 === 0}>
              <Input placeholder={`请输入表单项 ${index + 1}`} />
            </Form.Item>
          ))}
        </Form>
      </div>
    </div>
  );
};

export default PreviewForm;
