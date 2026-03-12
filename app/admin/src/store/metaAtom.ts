import { atom, useAtomValue, useSetAtom } from 'jotai';
import { map, get } from 'lodash';
import { useMemoizedFn, useRequest } from 'ahooks';
import { metaService } from '@/api/meta';
import type { MetaObjectDto } from '@/api/meta/interface';
import { META_CONFIG_TYPE } from '@/constant';
import { OptionProps } from 'antd/lib/select';
import { StringParam, useQueryParam } from 'use-query-params';
import { useParams } from 'react-router-dom';

/** appCode atom */
export const appCodeAtom = atom<string>('');

/** metaObjectCode atom */
export const metaObjectCodeAtom = atom<string>('');

/** configurableType atom */
export const configurableTypeAtom = atom<string>('');

/** metaObjectList atom */
export const metaObjectListAtom = atom<OptionProps[]>([]);

/** 设置 appCode */
export const useSetAppCodeAtom = () => {
  return useSetAtom(appCodeAtom);
};

/** 设置 metaObjectCode */
export const useSetMetaObjectCodeAtom = () => {
  return useSetAtom(metaObjectCodeAtom);
};

/** 设置 configurableType */
export const useSetConfigurableTypeAtom = () => {
  return useSetAtom(configurableTypeAtom);
};

/** 设置 metaObjectList */
export const useSetMetaObjectListAtom = () => {
  return useSetAtom(metaObjectListAtom);
};

/** 刷新触发器 atom */
export const metaObjectRefreshTriggerAtom = atom(0);

/** 刷新 metaObjects */
export const useRefreshMetaObjects = () => {
  const setRefreshTrigger = useSetAtom(metaObjectRefreshTriggerAtom);
  return () => setRefreshTrigger(prev => prev + 1);
};

/** 设置 metaObjectCode ，configurableType */

/** 初始化 metaObjects 数据源 */
export const useInitMetaObjects = () => {
  const { appCode } = useParams<{ appCode: string }>();
  // 获取查询参数
  const [metaObjectCode, setUrlMetaObjectCode] = useQueryParam('metaObjectCode', StringParam);
  const [configurableType, setUrlConfigurableType] = useQueryParam('configurableType', StringParam);

  const refreshTrigger = useAtomValue(metaObjectRefreshTriggerAtom);

  const setAppCodeAtom = useSetAppCodeAtom();
  const setMetaObjectCodeAtom = useSetMetaObjectCodeAtom();
  const setConfigurableTypeAtom = useSetConfigurableTypeAtom();
  const setMetaObjectListAtom = useSetMetaObjectListAtom();

  const setMetaObjectCode = useMemoizedFn((value: string) => {
    setUrlMetaObjectCode(value);
    setMetaObjectCodeAtom(value);
  });

  const setConfigurableType = useMemoizedFn((value: string) => {
    setUrlConfigurableType(value);
    setConfigurableTypeAtom(value);
  });

  useRequest(() => metaService.queryMetaObjects({ appCode }), {
    cacheKey: 'meta-objects-options',
    ready: !!appCode,
    refreshDeps: [appCode, refreshTrigger],
    onSuccess: res => {
      const list = get(res, 'data.list', []);

      const defaultMetaObjectCode = metaObjectCode || list?.[0]?.metaObjectCode;
      const defaultConfigurableType = configurableType || META_CONFIG_TYPE[0].value;

      setAppCodeAtom(appCode);
      setMetaObjectCode(defaultMetaObjectCode);
      setConfigurableType(defaultConfigurableType);
      setMetaObjectListAtom(list);
    },
  });

  return {
    setMetaObjectCode,
    setConfigurableType,
  };
};

/** 获取 Meta 上下文 (appCode, metaObjectCode, configurableType) */
export const useMeta = () => {
  const appCode = useAtomValue(appCodeAtom);
  const metaObjectCode = useAtomValue(metaObjectCodeAtom);
  const configurableType = useAtomValue(configurableTypeAtom);

  return { appCode, metaObjectCode, configurableType };
};

/** 获取 metaObjectList */
export const useMetaObjectListAtom = () => {
  return useAtomValue(metaObjectListAtom);
};
