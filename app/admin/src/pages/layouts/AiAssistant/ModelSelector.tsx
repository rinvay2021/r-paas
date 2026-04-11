import React from 'react';
import { Select } from 'antd';
import { useAiConfig } from './hooks/useAiConfig';

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ value, onChange }) => {
  const { models, loading } = useAiConfig();

  return (
    <Select
      value={value}
      onChange={onChange}
      loading={loading}
      size="small"
      style={{ width: 180 }}
      options={models.map(m => ({ label: m, value: m }))}
      placeholder="选择模型"
    />
  );
};

export default ModelSelector;
