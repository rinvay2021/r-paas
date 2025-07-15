/**
 * 获取表单数据源
 */
import React from 'react';
import { map } from 'lodash';
import { useRequest } from 'ahooks';
import { metaService } from '@/api/meta';
import { MetaContext } from '@/pages/configurable/meta';

interface UseFormDataProps {
  appCode?: string;
  metaObjectCode?: string;
}

export const useFormData = (props?: UseFormDataProps) => {
  // 优先使用路由上的 appCode 和 metaObjectCode
  const { appCode, metaObjectCode } = React.useContext(MetaContext);
  const { data, loading, refresh } = useRequest(
    () =>
      metaService.queryForms({
        appCode,
        metaObjectCode,
        ...props,
      }),
    {
      cacheKey: 'meta-use-form-data',
    }
  );

  const options = React.useMemo(() => {
    return map(data?.data?.list || [], form => ({
      label: form.formName,
      value: form.formCode,
    }));
  }, [data]);

  return {
    options,
    loading,
    refresh,
  };
};
