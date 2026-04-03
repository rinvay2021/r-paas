import React from 'react';
import { Button, Popconfirm, Space } from 'antd';
import { DeleteOutlined, EditOutlined, SettingOutlined } from '@ant-design/icons';
import { prefix } from '@/constant';
import './index.less';

const RENDERER_ORIGIN = 'http://localhost:3005';

interface PreviewFormProps {
  height: number;
  appCode?: string;
  metaObjectCode?: string;
  formCode?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetting?: () => void;
}

const PreviewForm: React.FC<PreviewFormProps> = props => {
  const { height, appCode, metaObjectCode, formCode, onEdit, onDelete, onSetting } = props;

  const iframeSrc = appCode && metaObjectCode && formCode
    ? `${RENDERER_ORIGIN}/?appCode=${appCode}&metaObjectCode=${metaObjectCode}&formCode=${formCode}`
    : null;

  return (
    <div
      id="form-preview"
      style={{ height: `${height}px` }}
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

      {/* 表单预览区域 */}
      <div className={`${prefix}-form-content`}>
        {iframeSrc ? (
          <iframe
            src={iframeSrc}
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
            title="form-preview"
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#bbb' }}>
            暂无预览
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewForm;
