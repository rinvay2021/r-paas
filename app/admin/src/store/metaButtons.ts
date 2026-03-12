/** 操作按钮数据源 */
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { get } from 'lodash';
import { useRequest } from 'ahooks';

import { useMeta } from '@/store/metaAtom';
import { metaService } from '@/api/meta';
import { ActionButtonDto, QueryActionButtonDto } from '@/api/meta/interface';

/** 按钮数据源 atom */
export const metaButtons = atom<ActionButtonDto[]>([]);

/** 获取按钮数据源 */
export const useMetaButtons = () => {
  const buttons = useAtomValue(metaButtons);
  return buttons;
};

/** 设置按钮数据源 */
export const useSetMetaButtons = () => {
  const setMetaButtons = useSetAtom(metaButtons);
  return (buttons: ActionButtonDto[]) => setMetaButtons(buttons);
};

/** loading atom */
export const loadingButtons = atom(false);

/** 获取 loading */
export const useLoadingButtons = () => {
  const loading = useAtomValue(loadingButtons);
  return loading;
};

/** 设置 loading */
export const useSetLoadingButtons = () => {
  const setLoadingButtons = useSetAtom(loadingButtons);
  return (loading: boolean) => setLoadingButtons(loading);
};

/** 刷新触发器 atom */
export const refreshMetaButtonsTrigger = atom(0);

/** 刷新按钮数据 */
export const useRefreshMetaButtons = () => {
  const setRefreshTrigger = useSetAtom(refreshMetaButtonsTrigger);
  return () => setRefreshTrigger(prev => prev + 1);
};

/** 触发器值 */
export const useMetaButtonsRefreshTrigger = () => {
  const refreshTrigger = useAtomValue(refreshMetaButtonsTrigger);
  return refreshTrigger;
};

/** 初始化按钮数据源 hook */
export const useInitMetaButtonAtom = (params?: QueryActionButtonDto) => {
  const { appCode, metaObjectCode } = useMeta();

  const setMetaButtons = useSetMetaButtons();
  const setLoadingButtons = useSetLoadingButtons();
  const refreshTrigger = useMetaButtonsRefreshTrigger();

  useRequest(
    () =>
      metaService.queryActionButtons({
        appCode,
        metaObjectCode,
        ...params,
      }),
    {
      ready: !!appCode && !!metaObjectCode,
      refreshDeps: [appCode, metaObjectCode, refreshTrigger],
      onSuccess: data => {
        const list = get(data, 'data.list', []);
        setMetaButtons(list);
      },
      onBefore: () => {
        setLoadingButtons(true);
      },
      onFinally: () => {
        setLoadingButtons(false);
      },
    }
  );
};
