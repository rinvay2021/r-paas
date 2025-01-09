import type { AppListItem } from './interface';

// 模拟的应用列表数据
const APP_LIST: AppListItem[] = [
  {
    id: 1,
    appName: '图书管理',
    appId: 'BookManagement',
  },
  {
    id: 2,
    appName: '用户管理',
    appId: 'UserManagement',
  },
];

// 获取应用列表的 API
export async function getAppList(): Promise<{
  data: AppListItem[];
  code: number;
  message: string;
  success: boolean;
}> {
  // 模拟网络延迟
  return new Promise(resolve =>
    setTimeout(() => {
      resolve({
        data: APP_LIST,
        code: 200,
        message: 'success',
        success: true,
      });
    }, 300)
  );
}

export type { AppListItem };
