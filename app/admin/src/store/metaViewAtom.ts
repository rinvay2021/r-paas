import { atom, useAtomValue, useSetAtom } from 'jotai';
import { get, find } from 'lodash';
import { useRequest } from 'ahooks';

import { useMeta } from '@/store/metaAtom';
import { metaService } from '@/api/meta';
import { ViewDto, QueryViewDto } from '@/api/meta/interface';

/** 视图数据源 atom */
export const metaViews = atom<ViewDto[]>([]);

/** 获取视图数据源 */
export const useMetaViews = () => {
  const views = useAtomValue(metaViews);
  return views;
};

/** 设置视图数据源 */
export const useSetMetaViews = () => {
  const setMetaViews = useSetAtom(metaViews);
  return (views: ViewDto[]) => setMetaViews(views);
};

/** loading atom */
export const loadingViews = atom(false);

/** 获取视图加载状态 */
export const useLoadingViews = () => {
  const loading = useAtomValue(loadingViews);
  return loading;
};

/** 设置视图加载状态 */
export const useSetLoadingViews = () => {
  const setLoadingViews = useSetAtom(loadingViews);
  return (loading: boolean) => setLoadingViews(loading);
};

/** 当前的视图 atom */
export const currentMetaView = atom<ViewDto>();

/** 设置当前的视图 */
export const useSetCurrentView = () => {
  const setCurrentView = useSetAtom(currentMetaView);
  return (view: ViewDto) => setCurrentView(view);
};

/** 获取当前的视图 */
export const useCurrentView = () => {
  const current = useAtomValue(currentMetaView);
  return current;
};

/** 刷新触发器 atom */
export const refreshMetaViewsTrigger = atom(0);

/** 刷新视图数据 */
export const useRefreshMetaViews = () => {
  const setRefreshTrigger = useSetAtom(refreshMetaViewsTrigger);
  return () => setRefreshTrigger(prev => prev + 1);
};

/** 触发器值 */
export const useMetaViewsRefreshTrigger = () => {
  const refreshTrigger = useAtomValue(refreshMetaViewsTrigger);
  return refreshTrigger;
};

/** 初始化视图数据源 hook */
export const useInitMetaViewAtom = (params?: QueryViewDto) => {
  const { appCode, metaObjectCode } = useMeta();

  const setMetaViews = useSetMetaViews();
  const setCurrentView = useSetCurrentView();
  const setLoadingViews = useSetLoadingViews();

  // 当前视图
  const activeView = useCurrentView();
  const refreshTrigger = useMetaViewsRefreshTrigger();

  useRequest(
    () =>
      metaService.queryViews({
        appCode,
        metaObjectCode,
        ...params,
      }),
    {
      cacheKey: 'meta-view-options',
      ready: !!appCode && !!metaObjectCode,
      /** 依赖刷新触发器 */
      refreshDeps: [appCode, metaObjectCode, refreshTrigger],
      onSuccess: data => {
        const list = get(data, 'data.list', []);

        setMetaViews(list);

        // 如果有当前视图，则设置当前视图
        const view = find(list, v => v.viewCode === activeView?.viewCode);
        const finalActiveView = view ? view : list?.[0];

        setCurrentView(finalActiveView);
      },
      onBefore: () => {
        setLoadingViews(true);
      },
      onFinally: () => {
        setLoadingViews(false);
      },
    }
  );
};
