import type { MenuDto, MenuPositionDto } from '@/api/meta/interface';
import type { DataNode } from 'antd/es/tree';

/** 菜单树节点 */
export interface MenuTreeNode extends DataNode {
  key: string;
  title: string;
  children?: MenuTreeNode[];
  menuData: MenuDto;
}

/**
 * 构建菜单树
 */
export function buildMenuTree(menus: MenuDto[]): MenuTreeNode[] {
  const menuMap = new Map<string, MenuTreeNode>();
  const rootMenus: MenuTreeNode[] = [];

  // 先按 orderNum 排序
  const sortedMenus = [...menus].sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0));

  // 构建映射
  sortedMenus.forEach(menu => {
    menuMap.set(menu._id!, {
      key: menu._id!,
      title: menu.menuName,
      children: [],
      menuData: menu,
    });
  });

  // 构建树
  sortedMenus.forEach(menu => {
    const node = menuMap.get(menu._id!)!;
    if (menu.parentId) {
      const parent = menuMap.get(menu.parentId);
      if (parent) {
        parent.children!.push(node);
      }
    } else {
      rootMenus.push(node);
    }
  });

  // 对子节点也进行排序
  rootMenus.forEach(root => {
    if (root.children && root.children.length > 0) {
      root.children.sort((a, b) =>
        (a.menuData.orderNum || 0) - (b.menuData.orderNum || 0)
      );
    }
  });

  return rootMenus;
}

/**
 * 扁平化菜单树，重新计算 parentId 和 orderNum
 */
export function flattenMenuTree(treeData: MenuTreeNode[]): MenuPositionDto[] {
  const result: MenuPositionDto[] = [];

  function traverse(nodes: MenuTreeNode[], parentId: string | null = null) {
    nodes.forEach((node, index) => {
      result.push({
        _id: node.key as string,
        parentId,
        orderNum: index + 1,
      });

      if (node.children && node.children.length > 0) {
        traverse(node.children, node.key as string);
      }
    });
  }

  traverse(treeData);
  return result;
}

/**
 * 检查是否可以拖拽到目标位置（限制最大两级）
 */
export function canDrop(dragNode: MenuTreeNode, dropNode: MenuTreeNode, dropPosition: number): boolean {
  // 如果拖拽节点有子节点，不允许拖到第二级
  if (dragNode.children && dragNode.children.length > 0 && dropNode.menuData.level === 1 && dropPosition === 0) {
    return false;
  }

  // 如果是拖到节点内部（dropPosition === 0），检查目标节点层级
  if (dropPosition === 0) {
    // 只允许拖到一级菜单内部
    return dropNode.menuData.level === 1;
  }

  return true;
}
