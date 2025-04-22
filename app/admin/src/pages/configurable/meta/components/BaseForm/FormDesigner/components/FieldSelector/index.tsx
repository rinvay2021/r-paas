import React, { useState, useContext, useMemo, useCallback } from 'react';
import { Tree, Input, Space, Button, Empty, Spin, message, Popover } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { map, filter } from 'lodash';
import type { DataNode } from 'antd/es/tree';
import { MetaContext } from '@/pages/configurable/meta';
import { metaService } from '@/api/meta';
import type { FieldDto } from '@/api/meta/interface';

import './index.less';

interface FieldSelectorProps {
  existingFields: Set<string>;
  onConfirm: (fields: FieldDto[]) => void;
  children?: React.ReactNode;
  trigger?: 'click' | 'hover';
}

interface TreeNodeData extends DataNode {
  rawTitle?: string;
  children?: TreeNodeData[];
}

// 修改转换逻辑，在这里就过滤掉已选中的字段
const convertToTreeData = (
  fields: FieldDto[],
  existingFields: Set<string>,
  groupName: string
): TreeNodeData[] => {
  const availableFields = filter(fields, field => {
    return !existingFields.has(field._id);
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
  ...restProps
}) => {
  const { appCode, metaObjectCode } = useContext(MetaContext);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [open, setOpen] = useState(false);

  // 获取字段列表
  const { data: originFields = [], loading } = useRequest(
    async () => {
      if (!appCode || !metaObjectCode) {
        throw new Error('缺少必要参数：appCode 或 metaObjectCode');
      }

      const response = await metaService.queryFields({
        appCode,
        metaObjectCode,
      });
      return response?.data?.list || [];
    },
    {
      ready: !!(appCode && metaObjectCode),
      onError: err => {
        message.error(`获取字段列表失败: ${err.message}`);
      },
    }
  );

  // 处理搜索和过滤逻辑
  const treeData = useMemo(() => {
    const originTreeData = convertToTreeData(
      originFields,
      existingFields,
      `${appCode}.${metaObjectCode}`
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

  const handleCheck = useCallback(
    (checked: string[] | { checked: string[]; halfChecked: string[] }) => {
      const checkedKeys = Array.isArray(checked) ? checked : checked.checked;
      setSelectedKeys(checkedKeys);
    },
    []
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value.trim());
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedKeys([]);
    setSearchValue('');
    setOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    // 获取选中的字段
    const selectedFields = filter(originFields, field => {
      return selectedKeys.includes(field._id);
    });

    onConfirm(selectedFields);

    setOpen(false);
    setSelectedKeys([]);
    setSearchValue('');
  }, [selectedKeys, onConfirm]);

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
