/** 表单数据源 */
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { map } from 'lodash';
import { useRequest } from 'ahooks';
import { OptionProps } from 'antd/lib/select';

import { useMeta } from '@/store/metaAtom';
import { metaService } from '@/api/meta';
import { FormDto, QueryFormDto } from '@/api/meta/interface';

/** 表单数据源 atom */
export const metaFormAtom = atom<OptionProps[]>([]);

/** 刷新触发器 atom */
export const metaFormRefreshTriggerAtom = atom(0);

/** 获取表单选项 */
export const useMetaFormOptions = () => {
  const options = useAtomValue(metaFormAtom);
  return options;
};

/** 刷新表单数据 */
export const useRefreshMetaForm = () => {
  const setRefreshTrigger = useSetAtom(metaFormRefreshTriggerAtom);
  return () => setRefreshTrigger(prev => prev + 1);
};

/** 初始化表单数据源 hook */
export const useInitMetaFormAtom = (params?: QueryFormDto) => {
  const { appCode, metaObjectCode } = useMeta();
  const setMetaFormAtom = useSetAtom(metaFormAtom);
  const refreshTrigger = useAtomValue(metaFormRefreshTriggerAtom);

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
        const options = map(data?.data?.list, (form: FormDto) => ({
          label: form.formName,
          value: form.formCode,
        }));
        setMetaFormAtom(options);
      },
    }
  );
};
