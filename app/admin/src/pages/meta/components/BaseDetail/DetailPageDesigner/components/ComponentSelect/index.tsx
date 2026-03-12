import React from 'react';
import { map, get } from 'lodash';
import { useRequest } from 'ahooks';
import { Select } from 'antd';
import { metaService } from '@/api/meta';
import { useMeta } from '@/store/metaAtom';
import { ComponentType } from '../../../types';

export interface ComponentSelectProps {
  metaObjectCode: string;
  componentType: string;
  value?: string;
  onChange?: (value: string) => void;
}

const ComponentSelect: React.FC<ComponentSelectProps> = ({
  metaObjectCode,
  componentType,
  value,
  onChange,
}) => {
  const { appCode } = useMeta();

  // 动态查询组件列表（列表或视图）
  const { data: componentData } = useRequest(
    async () => {
      if (!appCode || !metaObjectCode || !componentType) {
        return { data: { list: [] } };
      }

      if (componentType === ComponentType.List) {
        return metaService.queryLists({
          appCode,
          metaObjectCode,
          pageSize: -1,
        });
      }

      if (componentType === ComponentType.View) {
        return metaService.queryViews({
          appCode,
          metaObjectCode,
          pageSize: -1,
        });
      }

      return { data: { list: [] } };
    },
    {
      cacheKey: `component-${appCode}-${metaObjectCode}-${componentType}`,
      refreshDeps: [appCode, metaObjectCode, componentType],
    }
  );

  // 转换为 Select 选项
  const componentOptions = React.useMemo(() => {
    const list = get(componentData, 'data.list', []);

    if (componentType === ComponentType.List) {
      return map(list, item => ({
        value: item.listCode,
        label: item.listName,
      }));
    }

    if (componentType === ComponentType.View) {
      return map(list, item => ({
        value: item.viewCode,
        label: item.viewName,
      }));
    }

    return [];
  }, [componentData, componentType]);

  return (
    <Select
      placeholder="请先选择关联对象和组件类型"
      options={componentOptions}
      value={value}
      onChange={onChange}
    />
  );
};

export default ComponentSelect;
