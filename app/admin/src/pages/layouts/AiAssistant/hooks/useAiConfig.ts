import { useRequest } from 'ahooks';
import { aiApi } from '@/api/ai';
import type { AiConfig } from '@/api/ai/interface';

const MODEL_MAP: Record<string, string[]> = {
  zhipu: ['glm-4.7-flash', 'glm-4.5-air'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
};

export function useAiConfig() {
  const { data, loading } = useRequest(() => aiApi.getConfig());
  const config = (data as any)?.data as AiConfig | undefined;

  const models = config?.provider
    ? MODEL_MAP[config.provider] || []
    : [...MODEL_MAP.zhipu, ...MODEL_MAP.deepseek];

  return { config, loading, models };
}
