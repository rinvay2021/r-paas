import { atom, useAtomValue, useSetAtom } from 'jotai';
import { get } from 'lodash';
import { useRequest } from 'ahooks';

import { useMeta } from '@/store/metaAtom';
import { metaService } from '@/api/meta';
import { ListDto, QueryListDto } from '@/api/meta/interface';

/** 列表数据源 atom */
export const metaLists = atom<ListDto[]>([]);

/** 获取列表数据源 */
export const useMetaLists = () => {
    const lists = useAtomValue(metaLists);
    return lists;
};

/** 设置列表数据源 */
export const useSetMetaLists = () => {
    const setMetaLists = useSetAtom(metaLists);
    return (lists: ListDto[]) => setMetaLists(lists);
};

/** loading atom */
export const loadingLists = atom(false);

/** 获取列表数据源 */
export const useLoadingLists = () => {
    const loading = useAtomValue(loadingLists);
    return loading;
};

/** 设置列表数据源 */
export const useSetLoadingLists = () => {
    const setLoadingLists = useSetAtom(loadingLists);
    return (loading: boolean) => setLoadingLists(loading);
};

/** 当前的列表 atom */
export const currentMetaList = atom<ListDto>();

/** 设置当前的列表 */
export const useSetCurrentList = () => {
    const setCurrentList = useSetAtom(currentMetaList);
    return (list: ListDto) => setCurrentList(list);
};

/** 获取当前的列表 */
export const useCurrentList = () => {
    const current = useAtomValue(currentMetaList);
    return current;
};

/** 刷新触发器 atom */
export const refreshMetaListsTrigger = atom(0);

/** 刷新列表数据 */
export const useRefreshMetaLists = () => {
    const setRefreshTrigger = useSetAtom(refreshMetaListsTrigger);
    return () => setRefreshTrigger(prev => prev + 1);
};

/** 触发器值 */
export const useMetaListsRefreshTrigger = () => {
    const refreshTrigger = useAtomValue(refreshMetaListsTrigger);
    return refreshTrigger;
};

/** 初始化列表数据源 hook */
export const useInitMetaListAtom = (params?: QueryListDto) => {
    const { appCode, metaObjectCode } = useMeta();

    const setMetaLists = useSetMetaLists();
    const setCurrentList = useSetCurrentList();
    const setLoadingLists = useSetLoadingLists();
    const refreshTrigger = useMetaListsRefreshTrigger();

    useRequest(
        () =>
            metaService.queryLists({
                appCode,
                metaObjectCode,
                ...params,
            }),
        {
            cacheKey: 'meta-list-options',
            ready: !!appCode && !!metaObjectCode,
            /** 依赖刷新触发器 */
            refreshDeps: [appCode, metaObjectCode, refreshTrigger], // 
            onSuccess: data => {
                const list = get(data, 'data.list', [])

                setMetaLists(list);
                setCurrentList(list?.[0]);
            },
            onBefore: () => {
                setLoadingLists(true);
            },
            onFinally: () => {
                setLoadingLists(false);
            },
        })
};