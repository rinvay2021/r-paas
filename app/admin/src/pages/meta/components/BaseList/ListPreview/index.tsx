import React from 'react';
import { Button, Popconfirm, Space } from 'antd';
import { DeleteOutlined, EditOutlined, SettingOutlined } from '@ant-design/icons';
import { prefix, RENDERER_ORIGIN } from '@/constant';
import './index.less';

interface PreviewProps {
  height: number;
  appCode?: string;
  metaObjectCode?: string;
  listCode?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetting?: () => void;
}

const DetailPagePreview: React.FC<PreviewProps> = props => {
  const { height, appCode, metaObjectCode, listCode, onEdit, onDelete, onSetting } = props;

  const iframeSrc = appCode && metaObjectCode && listCode
    ? `${RENDERER_ORIGIN}/?appCode=${appCode}&metaObjectCode=${metaObjectCode}&listCode=${listCode}`
    : null;

  return (
    <div
      id="detail-preview"
      style={{ height: `${height}px` }}
      className={`${prefix}-preview-container`}
    >
      <Space direction="vertical" size="middle" className={`${prefix}-action-buttons`}>
        <Button shape="circle" icon={<EditOutlined />} size="large" onClick={onEdit} />
        <Button shape="circle" icon={<SettingOutlined />} size="large" onClick={onSetting} />
        <Popconfirm title="确定要删除吗？" onConfirm={onDelete} okText="确定" cancelText="取消" placement="bottom">
          <Button shape="circle" icon={<DeleteOutlined />} size="large" />
        </Popconfirm>
      </Space>
      <div className={`${prefix}-form-content`}>
        {iframeSrc ? (
          <iframe src={iframeSrc} style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }} title="list-preview" />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#bbb' }}>暂无预览</div>
        )}
      </div>
    </div>
  );
};

export default DetailPagePreview;
