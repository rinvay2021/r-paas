import React from 'react';
import { map, filter } from 'lodash';
import { useMemoizedFn } from 'ahooks';
import { SearchOutlined } from '@ant-design/icons';
import { Tree, Input, Space, Button, Empty, Spin, Popover } from 'antd';

import { useMeta } from '@/store/metaAtom';
import { useMetaFields, useLoadingFields } from '@/store/metaFields';
import type { DataNode } from 'antd/lib/tree';
import type { FieldDto } from '@/api/meta/interface';

import './index.less';

interface FieldSelectorProps {
  existingFields: Set<string>;
  onConfirm: (fields: FieldDto[]) => void;
  children?: React.ReactNode;
  trigger?: 'click' | 'hover';
  /** 字段类型过滤函数 */
  filterFieldType?: (fieldType: string) => boolean;
}

interface TreeNodeData extends DataNode {
  rawTitle?: string;
  children?: TreeNodeData[];
}

// 修改转换逻辑，在这里就过滤掉已选中的字段和不符合条件的字段类型
const convertToTreeData = (
  fields: FieldDto[],
  existingFields: Set<string>,
  groupName: string,
  filterFieldType?: (fieldType: string) => boolean
): TreeNodeData[] => {
  const availableFields = filter(fields, field => {
    // 过滤已存在的字段
    if (existingFields.has(field._id)) return false;
    // 如果提供了字段类型过滤函数，则应用过滤
    if (filterFieldType && field.fieldType) {
      return filterFieldType(field.fieldType);
    }
    return true;
  });

  return [
    {
      key: groupName,
      title: groupName,
      children: map(availableFields, field => ({
        key: field._id,
        title: field.fieldName,
        rawTitle: field.fieldName,
      })),
    },
  ];
};

export const FieldSelector: React.FC<FieldSelectorProps> = ({
  existingFields,
  onConfirm,
  children,
  trigger = 'click',
  filterFieldType,
  ...restProps
}) => {
  const { appCode, metaObjectCode } = useMeta();

  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);

  // 获取字段列表
  const originFields = useMetaFields();
  const loading = useLoadingFields();

  // 处理搜索和过滤逻辑
  const treeData = React.useMemo(() => {
    const originTreeData = convertToTreeData(
      originFields,
      existingFields,
      `${appCode}.${metaObjectCode}`,
      filterFieldType
    );

    const searchFields = (nodes: TreeNodeData[]): TreeNodeData[] => {
      return map(nodes, node => {
        if (node.children) {
          const filteredChildren = searchFields(node.children).filter(child => {
            if (searchValue) {
              const searchText = child.rawTitle || (child.title as string);
              return searchText.toLowerCase().includes(searchValue.toLowerCase());
            }
            return true;
          });

          return filteredChildren?.length > 0
            ? {
                ...node,
                children: filteredChildren,
                selectable: false,
                checkable: false,
              }
            : null;
        }

        return node;
      }).filter(Boolean) as TreeNodeData[];
    };

    return searchFields(originTreeData);
  }, [originFields, searchValue, existingFields]);

  const handleCheck = useMemoizedFn(
    (checked: string[] | { checked: string[]; halfChecked: string[] }) => {
      const checkedKeys = Array.isArray(checked) ? checked : checked.checked;
      setSelectedKeys(checkedKeys);
    }
  );

  const handleSearch = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value.trim());
  });

  const handleCancel = useMemoizedFn(() => {
    setSelectedKeys([]);
    setSearchValue('');
    setOpen(false);
  });

  const handleConfirm = useMemoizedFn(() => {
    // 获取选中的字段
    const selectedFields = filter(originFields, field => {
      return selectedKeys.includes(field._id);
    });

    onConfirm(selectedFields);

    setOpen(false);
    setSelectedKeys([]);
    setSearchValue('');
  });

  const content = (
    <div className="field-selector">
      <div className="field-selector-search">
        <Input
          allowClear
          placeholder="搜索字段"
          value={searchValue}
          prefix={<SearchOutlined />}
          onChange={handleSearch}
        />
      </div>
      <div className="field-selector-content">
        {loading ? (
          <div className="field-selector-loading">
            <Spin />
          </div>
        ) : treeData?.length > 0 ? (
          <Tree
            checkable
            defaultExpandAll
            selectable={false}
            treeData={treeData}
            checkedKeys={selectedKeys}
            onCheck={handleCheck}
          />
        ) : (
          <Empty description="暂无可选字段" />
        )}
      </div>
      <div className="field-selector-footer">
        <Space>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleConfirm} disabled={selectedKeys.length === 0}>
            确定({selectedKeys.length})
          </Button>
        </Space>
      </div>
    </div>
  );

  return (
    <Popover open={open} trigger={trigger} content={content} onOpenChange={setOpen} {...restProps}>
      {children}
    </Popover>
  );
};
