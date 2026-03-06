import { atom, useAtomValue, useSetAtom } from 'jotai';
import { get } from 'lodash';
import { useRequest } from 'ahooks';

import { useMeta } from '@/store/metaAtom';
import { metaService } from '@/api/meta';
import { SearchFormDto, QuerySearchFormDto } from '@/api/meta/interface';

/** 搜索表单数据源 atom */
export const metaSearchForms = atom<SearchFormDto[]>([]);

/** 获取搜索表单数据源 */
export const useMetaSearchForms = () => {
  const options = useAtomValue(metaSearchForms);
  return options;
};

/** 设置搜索表单数据源 */
export const useSetMetaSearchForms = () => {
  const setMetaSearchForms = useSetAtom(metaSearchForms);
  return (searchForms: SearchFormDto[]) => setMetaSearchForms(searchForms);
};

/** loading atom */
export const loadingSearchForms = atom<boolean>(false);

/** 获取 loading */
export const useLoadingSearchForms = () => {
  const loading = useAtomValue(loadingSearchForms);
  return loading;
};

/** 设置 loading */
export const useSetLoadingSearchForms = () => {
  const setLoadingSearchForms = useSetAtom(loadingSearchForms);
  return (loading: boolean) => setLoadingSearchForms(loading);
};

/** 当前的搜索表单 atom */
export const currentMetaSearchForm = atom<SearchFormDto>();

/** 设置当前的搜索表单 */
export const useSetCurrentMetaSearchForm = () => {
  const setCurrentMetaSearchForm = useSetAtom(currentMetaSearchForm);
  return (searchForm: SearchFormDto) => setCurrentMetaSearchForm(searchForm);
};

/** 获取当前的搜索表单 */
export const useCurrentMetaSearchForm = () => {
  const current = useAtomValue(currentMetaSearchForm);
  return current;
};

/** 刷新触发器 atom */
export const refreshMetaSearchFormsTrigger = atom(0);

/** 刷新搜索表单数据 */
export const useRefreshMetaSearchForms = () => {
  const setRefreshTrigger = useSetAtom(refreshMetaSearchFormsTrigger);
  return () => setRefreshTrigger(prev => prev + 1);
};

/** 触发器值 */
export const useMetaSearchFormsRefreshTrigger = () => {
  const refreshTrigger = useAtomValue(refreshMetaSearchFormsTrigger);
  return refreshTrigger;
};

/** 初始化搜索表单数据源 hook */
export const useInitMetaSearchFormAtom = (params?: QuerySearchFormDto) => {
  const { appCode, metaObjectCode } = useMeta();

  const setMetaSearchForms = useSetMetaSearchForms();
  const setCurrentMetaSearchForm = useSetCurrentMetaSearchForm();
  const setLoadingSearchForms = useSetLoadingSearchForms();
  const refreshTrigger = useMetaSearchFormsRefreshTrigger();

  useRequest(
    () =>
      metaService.querySearchForms({
        appCode,
        metaObjectCode,
        ...params,
      }),
    {
      cacheKey: 'meta-search-form-options',
      ready: !!appCode && !!metaObjectCode,
      refreshDeps: [appCode, metaObjectCode, refreshTrigger], // 依赖刷新触发器
      onSuccess: data => {
        const list = get(data, 'data.list', []);

        setMetaSearchForms(list);
        setCurrentMetaSearchForm(list[0]);
      },
      onBefore: () => {
        setLoadingSearchForms(true);
      },
      onFinally: () => {
        setLoadingSearchForms(false);
      },
    }
  );
};
