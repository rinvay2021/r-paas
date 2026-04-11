/**
 * AiAssistant - AI 元数据助手入口
 *
 * 设计决策：使用右侧 Drawer 而不是 Modal
 * - Drawer 不遮挡主内容，用户可以边看页面边和 AI 对话
 * - 宽度固定 480px，足够展示确认卡片和工具调用列表
 * - 保持 destroyOnClose=false，对话历史不丢失
 */
import React from 'react';
import { Drawer, Button, Tooltip, Space, Typography } from 'antd';
import {
  RobotOutlined, ClearOutlined, SettingOutlined,
  StopOutlined, CloseOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAiChat } from './hooks/useAiChat';
import MessageList from './MessageList';
import InputArea from './InputArea';
import ModelSelector from './ModelSelector';
import './index.less';

const AiAssistant: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [inputVal, setInputVal] = React.useState('');
  const { appCode } = useParams<{ appCode?: string }>();
  const navigate = useNavigate();

  const {
    messages, loading, restoring,
    selectedModel, setSelectedModel,
    sendMessage, reset, sessionId,
    confirmPlan, cancelPlan, interrupt,
  } = useAiChat();

  const handleSend = () => {
    const text = inputVal.trim();
    if (!text || loading) return;
    setInputVal('');
    sendMessage(text, appCode);
  };

  const handleQuickPrompt = (text: string) => {
    setInputVal(text);
    // 聚焦输入框
    setTimeout(() => {
      const ta = document.querySelector('.ai-input-area textarea') as HTMLTextAreaElement;
      ta?.focus();
      ta?.setSelectionRange(text.length, text.length);
    }, 50);
  };

  return (
    <>
      {/* 浮动触发按钮 */}
      <div
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#1a1a1a',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          zIndex: 999,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.24)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
        }}
      >
        <RobotOutlined style={{ fontSize: 20 }} />
      </div>

      {/* Drawer */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        width={900}
        placement="right"
        closable={false}
        destroyOnClose={false}
        className="ai-assistant-drawer"
        styles={{
          body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' },
          header: { display: 'none' },
        }}
        maskStyle={{ background: 'rgba(0,0,0,0.12)' }}
      >
        {/* 自定义 Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px 14px 20px',
          borderBottom: '1px solid #f0f0f0',
          flexShrink: 0,
          background: '#fff',
        }}>
          <Space size={8}>
            <RobotOutlined style={{ color: '#1a1a1a', fontSize: 15 }} />
            <Typography.Text strong style={{ fontSize: 14 }}>AI 元数据助手</Typography.Text>
            {appCode && (
              <span style={{
                fontSize: 11,
                color: '#8c8c8c',
                background: '#f5f5f5',
                borderRadius: 4,
                padding: '1px 6px',
              }}>
                {appCode}
              </span>
            )}
            {restoring && (
              <span style={{ fontSize: 11, color: '#faad14' }}>恢复中...</span>
            )}
          </Space>

          <Space size={4}>
            <ModelSelector value={selectedModel} onChange={setSelectedModel} />
            {loading && (
              <Tooltip title="中断执行">
                <Button type="text" size="small" icon={<StopOutlined />}
                  onClick={interrupt} style={{ color: '#ff4d4f' }} />
              </Tooltip>
            )}
            <Tooltip title="清空对话">
              <Button type="text" size="small" icon={<ClearOutlined />}
                onClick={reset} disabled={loading} />
            </Tooltip>
            <Tooltip title="AI 配置">
              <Button type="text" size="small" icon={<SettingOutlined />}
                onClick={() => { setOpen(false); navigate('/settings'); }} />
            </Tooltip>
            <Button type="text" size="small" icon={<CloseOutlined />}
              onClick={() => setOpen(false)} />
          </Space>
        </div>

        {/* 消息列表 */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <MessageList
            messages={messages}
            loading={loading}
            onConfirmPlan={confirmPlan}
            onCancelPlan={cancelPlan}
            onQuickPrompt={handleQuickPrompt}
          />
        </div>

        {/* 输入区 */}
        <div className="ai-input-area">
          <InputArea
            value={inputVal}
            onChange={setInputVal}
            onSend={handleSend}
            loading={loading}
          />
        </div>
      </Drawer>
    </>
  );
};

export default AiAssistant;
