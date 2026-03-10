import React from 'react';
import { Button, Space, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined, SettingOutlined } from '@ant-design/icons';
import { prefix } from '@/constant';

import './index.less';

interface ViewPreviewProps {
  height: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetting?: () => void;
}

const ViewPreview: React.FC<ViewPreviewProps> = props => {
  const { height, onEdit, onDelete, onSetting } = props;

  return (
    <div
      id="view-preview"
      style={{ height: `${height}px` }}
      className={`${prefix}-view-preview-container`}
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

      {/* 预览内容区域 */}
      <div className={`${prefix}-preview-content`}>
        <div style={{ padding: '24px', color: '#999' }}>
          预览内容
        </div>
      </div>
    </div>
  );
};

export default ViewPreview;
