/** 表单数据源 */
import React from 'react';
import { atom, useAtom } from 'jotai';
import { map } from 'lodash';
import { useRequest } from 'ahooks';
import { OptionProps } from 'antd/es/select';

import { useMeta } from '@/pages/meta';
import { metaService } from '@/api/meta';

export const useMetaFormAtom = (params?: Record<string, unknown>) => {
  const { appCode, metaObjectCode } = useMeta();

  const { data, loading, refresh } = useRequest(
    () =>
      metaService.queryForms({
        appCode,
        metaObjectCode,
        ...params,
      }),
    {
      cacheKey: 'meta-form-options',
    }
  );

  const metaData = data?.data?.list || [];

  const options = React.useMemo(() => {
    return map(metaData || [], form => ({
      label: form.formName,
      value: form.formCode,
    }));
  }, [data]);

  return {
    options,
    loading,
    refresh,
    metaData,
  };
};
