/**
 * InputArea - 输入区
 * 简洁的多行输入框 + 发送按钮
 */
import React from 'react';
import { Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';

interface InputAreaProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  loading: boolean;
  placeholder?: string;
}

const InputArea: React.FC<InputAreaProps> = ({ value, onChange, onSend, loading, placeholder }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && value.trim()) onSend();
    }
  };

  return (
    <div
      style={{
        borderTop: '1px solid #f0f0f0',
        padding: '10px 16px 12px',
        background: '#fff',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
        <Input.TextArea
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || '描述你的需求... (Enter 发送，Shift+Enter 换行)'}
          autoSize={{ minRows: 1, maxRows: 5 }}
          disabled={loading}
          style={{
            resize: 'none',
            flex: 1,
            fontSize: 13,
            background: '#fafafa',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}
          variant="filled"
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={onSend}
          loading={loading}
          disabled={!value.trim()}
          style={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
        >
          发送
        </Button>
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: '#bfbfbf', textAlign: 'right' }}>
        Enter 发送 · Shift+Enter 换行
      </div>
    </div>
  );
};

export default InputArea;
