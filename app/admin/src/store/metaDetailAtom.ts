/** 详情页数据源 */
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { get } from 'lodash';
import { useRequest } from 'ahooks';

import { useMeta } from '@/store/metaAtom';
import { metaService } from '@/api/meta';
import { DetailPageDto, QueryDetailPageDto } from '@/api/meta/interface';

/** 详情页数据源 atom */
export const metaDetails = atom<DetailPageDto[]>([]);

/** 获取详情页选项 */
export const useMetaDetails = () => {
  const options = useAtomValue(metaDetails);
  return options;
};

/** 设置详情页选项 */
export const useSetMetaDetails = () => {
  const setMetaDetails = useSetAtom(metaDetails);
  return (details: DetailPageDto[]) => setMetaDetails(details);
};

/** loading atom */
export const loadingDetails = atom(false);

/** 设置 loading */
export const useSetLoadingDetails = () => {
  const setLoadingDetails = useSetAtom(loadingDetails);
  return (loading: boolean) => setLoadingDetails(loading);
};

/** 获取 loading */
export const useLoadingDetails = () => {
  const loading = useAtomValue(loadingDetails);
  return loading;
};

/** 当前的详情页 atom */
export const currentMetaDetail = atom<DetailPageDto>();

/** 设置当前的详情页 */
export const useSetCurrentDetail = () => {
  const setCurrentDetail = useSetAtom(currentMetaDetail);
  return (detail: DetailPageDto) => setCurrentDetail(detail);
};

/** 获取当前的详情页 */
export const useCurrentDetail = () => {
  const current = useAtomValue(currentMetaDetail);
  return current;
};

/** 刷新触发器 atom */
export const refreshMetaDetailsTrigger = atom(0);

/** 刷新详情页数据 */
export const useRefreshMetaDetails = () => {
  const setRefreshTrigger = useSetAtom(refreshMetaDetailsTrigger);
  return () => setRefreshTrigger(prev => prev + 1);
};

/** 触发器值 */
export const useMetaDetailsRefreshTrigger = () => {
  const refreshTrigger = useAtomValue(refreshMetaDetailsTrigger);
  return refreshTrigger;
};

/** 初始化详情页数据源 hook */
export const useInitMetaDetailAtom = (params?: QueryDetailPageDto) => {
  const { appCode, metaObjectCode } = useMeta();
  const setMetaDetails = useSetMetaDetails();
  const setCurrentDetail = useSetCurrentDetail();
  const setLoadingDetails = useSetLoadingDetails();
  const refreshTrigger = useMetaDetailsRefreshTrigger();

  useRequest(
    () =>
      metaService.queryDetailPages({
        appCode,
        metaObjectCode,
        ...params,
      }),
    {
      cacheKey: 'meta-detail-options',
      ready: !!appCode && !!metaObjectCode,
      refreshDeps: [appCode, metaObjectCode, refreshTrigger], // 依赖刷新触发器
      onSuccess: data => {
        setMetaDetails(get(data, 'data.list', []));
        setCurrentDetail(get(data, 'data.list[0]'));
      },
      onBefore: () => {
        setLoadingDetails(true);
      },
      onFinally: () => {
        setLoadingDetails(false);
      },
    }
  );
};
