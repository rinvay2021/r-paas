import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MenuDto } from '@/api/meta/interface';
import { metaService } from '@/api/meta';

/** 菜单列表 */
export const menuListAtom = atom<MenuDto[]>([]);

/** 当前选中的菜单 */
export const currentMenuAtom = atom<MenuDto | null>(null);

/** 加载状态 */
export const loadingMenusAtom = atom<boolean>(false);

/** 刷新触发器 */
const refreshMenusTriggerAtom = atom<number>(0);

/** 使用菜单列表 */
export const useMenuList = () => useAtomValue(menuListAtom);

/** 使用当前菜单 */
export const useCurrentMenu = () => useAtomValue(currentMenuAtom);

/** 设置当前菜单 */
export const useSetCurrentMenu = () => useSetAtom(currentMenuAtom as any);

/** 使用加载状态 */
export const useLoadingMenus = () => useAtomValue(loadingMenusAtom);

/** 刷新菜单列表 */
export const useRefreshMenus = () => {
  const setTrigger = useSetAtom(refreshMenusTriggerAtom);
  return () => setTrigger(prev => prev + 1);
};

/** 初始化菜单列表 */
export const useInitMenuList = () => {
  const { appCode } = useParams<{ appCode: string }>();
  const [, setMenuList] = useAtom(menuListAtom);
  const [, setLoading] = useAtom(loadingMenusAtom);
  const trigger = useAtomValue(refreshMenusTriggerAtom);

  useEffect(() => {
    if (!appCode) {
      setMenuList([]);
      return;
    }

    const loadMenus = async () => {
      setLoading(true);
      try {
        const result = await metaService.getMenuList({ appCode });
        setMenuList(result?.data || []);
      } catch (error) {
        console.error('加载菜单列表失败', error);
        setMenuList([]);
      } finally {
        setLoading(false);
      }
    };

    loadMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appCode, trigger]);
};
