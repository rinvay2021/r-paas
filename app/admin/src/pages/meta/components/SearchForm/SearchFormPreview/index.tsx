import React from 'react';
import { Button, Form, Input, Popconfirm, Space } from 'antd';
import { DeleteOutlined, EditOutlined, SettingOutlined } from '@ant-design/icons';
import { prefix } from '@/constant';

import './index.less';

interface SearchFormPreviewProps {
  height: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetting?: () => void;
}

const SearchFormPreview: React.FC<SearchFormPreviewProps> = props => {
  const { height, onEdit, onDelete, onSetting } = props;

  return (
    <div
      id="search-form-preview"
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

      {/* 搜索表单内容区域 */}
      {/* TODO：后续替换真实的搜索表单渲染控件 */}
      <div className={`${prefix}-form-content`}>
        <Form className={`${prefix}-form`} layout="vertical">
          {/* 模拟一些搜索表单项来测试滚动 */}
          {Array.from({ length: 5 }, (_, index) => (
            <Form.Item key={index} label={`搜索字段 ${index + 1}`}>
              <Input placeholder={`请输入搜索字段 ${index + 1}`} />
            </Form.Item>
          ))}
        </Form>
      </div>
    </div>
  );
};

export default SearchFormPreview;
