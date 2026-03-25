import React, { useMemo, useState, useEffect } from 'react';
import { Tree, Empty, message } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import type { MenuDto } from '@/api/meta/interface';
import { buildMenuTree, canDrop, type MenuTreeNode } from '../utils';
import './MenuTree.less';

interface MenuTreeProps {
  menus: MenuDto[];
  selectedMenu: MenuDto | null;
  onSelect: (menu: MenuDto) => void;
  onDragComplete: (updatedMenus: MenuDto[]) => void;
}

const MenuTree: React.FC<MenuTreeProps> = ({ menus, selectedMenu, onSelect, onDragComplete }) => {
  // 本地树形数据状态（用于实时拖拽更新）
  const [localTreeData, setLocalTreeData] = useState<MenuTreeNode[]>(() => buildMenuTree(menus));

  // 展开的节点
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // 当外部 menus 变化时，更新本地树形数据
  useEffect(() => {
    const treeData = buildMenuTree(menus);
    setLocalTreeData(treeData);

    // 默认展开所有一级菜单
    const allKeys = treeData.map(node => node.key);
    setExpandedKeys(allKeys);
  }, [menus]);

  // 选中的节点
  const selectedKeys = useMemo(() => {
    return selectedMenu?._id ? [selectedMenu._id] : [];
  }, [selectedMenu]);

  // 处理展开/收起
  const handleExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
  };

  // 节点选择
  const handleSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length > 0) {
      const node = info.node as MenuTreeNode;
      onSelect(node.menuData);
    }
  };

  // 拖拽完成
  const handleDrop = (info: any) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    // 检查是否可以拖拽
    if (!canDrop(info.dragNode, info.node, dropPosition)) {
      message.warning('不支持超过两级菜单');
      return;
    }

    // 构建新的树结构
    const loop = (
      data: MenuTreeNode[],
      key: React.Key,
      callback: (node: MenuTreeNode, i: number, data: MenuTreeNode[]) => void
    ) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          callback(data[i], i, data);
          return;
        }
        if (data[i].children) {
          loop(data[i].children!, key, callback);
        }
      }
    };

    const data = JSON.parse(JSON.stringify(localTreeData)) as MenuTreeNode[];
    let dragObj: MenuTreeNode;

    // 找到拖拽的节点并移除
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      // 拖到节点内部
      loop(data, dropKey, item => {
        item.children = item.children || [];
        item.children.unshift(dragObj!);
      });
    } else if (
      (info.node.children || []).length > 0 &&
      info.node.expanded &&
      dropPosition === 1
    ) {
      // 拖到展开的节点下方
      loop(data, dropKey, item => {
        item.children = item.children || [];
        item.children.unshift(dragObj!);
      });
    } else {
      // 拖到节点上方或下方
      let ar: MenuTreeNode[] = [];
      let i: number;

      loop(data, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });

      if (dropPosition === -1) {
        ar.splice(i!, 0, dragObj!);
      } else {
        ar.splice(i! + 1, 0, dragObj!);
      }
    }

    // 扁平化树，重新计算菜单数据
    const updatedMenus: MenuDto[] = [];
    const flattenTree = (nodes: MenuTreeNode[], parentId: string | null = null, level: number = 1) => {
      nodes.forEach((node, index) => {
        const menu = {
          ...node.menuData,
          parentId,
          orderNum: index + 1,
          level,
        };
        updatedMenus.push(menu);

        if (node.children && node.children.length > 0) {
          flattenTree(node.children, node.key as string, level + 1);
        }
      });
    };

    flattenTree(data);

    // 更新树节点的 menuData，保持同步
    const updateMenuData = (nodes: MenuTreeNode[]) => {
      nodes.forEach(node => {
        const updatedMenu = updatedMenus.find(m => m._id === node.key);
        if (updatedMenu) {
          node.menuData = updatedMenu;
        }
        if (node.children && node.children.length > 0) {
          updateMenuData(node.children);
        }
      });
    };

    updateMenuData(data);

    // 立即更新本地树形数据，实现实时拖拽效果
    setLocalTreeData(data);

    // 通知父组件有待保存的变更
    onDragComplete(updatedMenus);
  };

  // 自定义标题渲染
  const renderTitle = (node: MenuTreeNode) => {
    const menu = node.menuData;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedKeys.includes(node.key);

    const handleToggleExpand = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasChildren) {
        if (isExpanded) {
          setExpandedKeys(prev => prev.filter(key => key !== node.key));
        } else {
          setExpandedKeys(prev => [...prev, node.key]);
        }
      }
    };

    return (
      <div className="menu-tree-node">
        <div className="menu-tree-node-content">
          {hasChildren ? (
            <CaretDownOutlined
              className="menu-tree-node-expand-icon"
              style={{
                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              }}
              onClick={handleToggleExpand}
            />
          ) : (
            <span className="menu-tree-node-expand-placeholder" />
          )}
          <span className="menu-tree-node-title">{menu.menuName}</span>
          {hasChildren && (
            <span className="menu-tree-node-count">({node.children.length})</span>
          )}
        </div>
      </div>
    );
  };

  if (localTreeData.length === 0) {
    return (
      <div className="menu-tree-empty">
        <Empty description="暂无菜单，请点击右上角新建菜单" />
      </div>
    );
  }

  return (
    <div className="menu-tree-wrapper">
      <Tree
        showIcon={false}
        showLine={false}
        draggable
        blockNode
        expandedKeys={expandedKeys}
        onExpand={handleExpand}
        treeData={localTreeData}
        selectedKeys={selectedKeys}
        onSelect={handleSelect}
        onDrop={handleDrop}
        titleRender={renderTitle}
        switcherIcon={() => null}
        className="menu-tree"
      />
    </div>
  );
};

export default MenuTree;
