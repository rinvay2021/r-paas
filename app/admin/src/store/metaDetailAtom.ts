/** 详情页数据源 */
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { map } from 'lodash';
import { useRequest } from 'ahooks';

import { useMeta } from '@/store/metaAtom';
import { metaService } from '@/api/meta';
import { DetailPageDto, QueryDetailPageDto } from '@/api/meta/interface';
import { OptionProps } from 'antd/lib/select';

/** 详情页数据源 atom */
export const metaDetailAtom = atom<OptionProps[]>([]);

/** 刷新触发器 atom */
export const metaDetailRefreshTriggerAtom = atom(0);

/** 获取详情页选项 */
export const useMetaDetailOptions = () => {
  const options = useAtomValue(metaDetailAtom);
  return options;
};

/** 刷新详情页数据 */
export const useRefreshMetaDetail = () => {
  const setRefreshTrigger = useSetAtom(metaDetailRefreshTriggerAtom);
  return () => setRefreshTrigger(prev => prev + 1);
};

/** 初始化详情页数据源 hook */
export const useInitMetaDetailAtom = (params?: QueryDetailPageDto) => {
  const { appCode, metaObjectCode } = useMeta();
  const setMetaDetailAtom = useSetAtom(metaDetailAtom);
  const refreshTrigger = useAtomValue(metaDetailRefreshTriggerAtom);

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
        const options = map(data?.data?.list, (detail: DetailPageDto) => ({
          label: detail.detailPageName,
          value: detail.detailPageCode,
        }));
        setMetaDetailAtom(options);
      },
    }
  );
};
