/** 表单数据源 */
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { map } from 'lodash';
import { useRequest } from 'ahooks';
import { OptionProps } from 'antd/lib/select';

import { useMeta } from '@/store/metaAtom';
import { metaService } from '@/api/meta';
import { FormDto, QueryFormDto } from '@/api/meta/interface';

/** 表单数据源 atom */
export const metaFroms = atom<OptionProps[]>([]);

/** 获取表单数据源 */
export const useMetaFroms = () => {
  const options = useAtomValue(metaFroms);
  return options;
};

/** 设置表单数据源 */
export const useSetMetaFroms = () => {
  const setMetaFroms = useSetAtom(metaFroms);
  return (froms: OptionProps[]) => setMetaFroms(froms);
};

/** loading atom */
export const loadingForms = atom<boolean>(false);

/** 获取 loading */
export const useLoadingForms = () => {
  const loading = useAtomValue(loadingForms);
  return loading;
};

/** 设置 loading */
export const useSetLoadingForms = () => {
  const setLoadingForms = useSetAtom(loadingForms);
  return (loading: boolean) => setLoadingForms(loading);
};

/** 当前的表单 atom */
export const currentMetaForm = atom<FormDto>();

/** 设置当前的表单 */
export const useSetCurrentMetaForm = () => {
  const setCurrentMetaForm = useSetAtom(currentMetaForm);
  return (form: FormDto) => setCurrentMetaForm(form);
};

/** 获取当前的表单 */
export const useCurrentMetaForm = () => {
  const current = useAtomValue(currentMetaForm);
  return current;
};

/** 刷新触发器 atom */
export const refreshMetaFormsTrigger = atom(0);

/** 刷新表单数据 */
export const useRefreshMetaForms = () => {
  const setRefreshTrigger = useSetAtom(refreshMetaFormsTrigger);
  return () => setRefreshTrigger(prev => prev + 1);
};

/** 触发器值 */
export const useMetaFormsRefreshTrigger = () => {
  const refreshTrigger = useAtomValue(refreshMetaFormsTrigger);
  return refreshTrigger;
};


/** 初始化表单数据源 hook */
export const useInitMetaFormAtom = (params?: QueryFormDto) => {
  const { appCode, metaObjectCode } = useMeta();
  const setMetaFroms = useSetMetaFroms();
  const setCurrentMetaForm = useSetCurrentMetaForm();
  const setLoadingForms = useSetLoadingForms();
  const refreshTrigger = useMetaFormsRefreshTrigger();

  useRequest(
    () =>
      metaService.queryForms({
        appCode,
        metaObjectCode,
        ...params,
      }),
    {
      cacheKey: 'meta-form-options',
      ready: !!appCode && !!metaObjectCode,
      refreshDeps: [appCode, metaObjectCode, refreshTrigger], // 依赖刷新触发器
      onSuccess: data => {
        setMetaFroms(data?.data?.list);
        setCurrentMetaForm(data?.data?.list[0]);
      },
      onBefore: () => {
        setLoadingForms(true);
      },
      onFinally: () => {
        setLoadingForms(false);
      },
    }
  );
};
