/** 字段数据源 */
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { get } from 'lodash';
import { useRequest } from 'ahooks';

import { useMeta } from '@/store/metaAtom';
import { metaService } from '@/api/meta';
import { FieldDto, QueryFieldDto } from '@/api/meta/interface';

/** 字段数据源 atom */
export const metaFields = atom<FieldDto[]>([]);

/** 获取字段数据源 */
export const useMetaFields = () => {
  const fields = useAtomValue(metaFields);
  return fields;
};

/** 设置字段数据源 */
export const useSetMetaFields = () => {
  const setMetaFields = useSetAtom(metaFields);
  return (fields: FieldDto[]) => setMetaFields(fields);
};

/** loading atom */
export const loadingFields = atom(false);

/** 获取 loading */
export const useLoadingFields = () => {
  const loading = useAtomValue(loadingFields);
  return loading;
};

/** 设置 loading */
export const useSetLoadingFields = () => {
  const setLoadingFields = useSetAtom(loadingFields);
  return (loading: boolean) => setLoadingFields(loading);
};

/** 刷新触发器 atom */
export const refreshMetaFieldsTrigger = atom(0);

/** 刷新字段数据 */
export const useRefreshMetaFields = () => {
  const setRefreshTrigger = useSetAtom(refreshMetaFieldsTrigger);
  return () => setRefreshTrigger(prev => prev + 1);
};

/** 触发器值 */
export const useMetaFieldsRefreshTrigger = () => {
  const refreshTrigger = useAtomValue(refreshMetaFieldsTrigger);
  return refreshTrigger;
};

/** 初始化字段数据源 hook */
export const useInitMetaFieldAtom = (params?: QueryFieldDto) => {
  const { appCode, metaObjectCode } = useMeta();

  const setMetaFields = useSetMetaFields();
  const setLoadingFields = useSetLoadingFields();
  const refreshTrigger = useMetaFieldsRefreshTrigger();

  useRequest(
    () =>
      metaService.queryFields({
        appCode,
        metaObjectCode,
        ...params,
      }),
    {
      ready: !!appCode && !!metaObjectCode,
      refreshDeps: [appCode, metaObjectCode, refreshTrigger],
      onSuccess: data => {
        const list = get(data, 'data.list', []);
        setMetaFields(list);
      },
      onBefore: () => {
        setLoadingFields(true);
      },
      onFinally: () => {
        setLoadingFields(false);
      },
    }
  );
};
