import React from 'react';
import { map, get, filter, includes } from 'lodash';
import { useRequest } from 'ahooks';
import { Transfer } from 'antd';
import { metaService } from '@/api/meta';
import { useMeta } from '@/store/metaAtom';
import { ActionButtonDto } from '@/api/meta/interface';
import { ButtonLevel } from '@/pages/meta/components/FunctionButton/type';
import { ComponentType } from '../../../types';

import './index.less';

export interface ComponentButtonSelectProps {
  metaObjectCode: string;
  componentType: string;
  value?: ActionButtonDto[];
  onChange?: (value: ActionButtonDto[]) => void;
}

const ComponentButtonSelect: React.FC<ComponentButtonSelectProps> = ({
  metaObjectCode,
  componentType,
  value = [],
  onChange,
}) => {
  const { appCode } = useMeta();

  // 动态查询该对象的所有按钮
  const { data: buttonData } = useRequest(
    async () => {
      if (!appCode || !metaObjectCode) {
        return { data: { list: [] } };
      }

      return metaService.queryActionButtons({
        appCode,
        metaObjectCode,
        pageSize: -1,
      });
    },
    {
      cacheKey: `component-buttons-${appCode}-${metaObjectCode}`,
      refreshDeps: [appCode, metaObjectCode],
    }
  );

  const buttons = get(buttonData, 'data.list', []) as ActionButtonDto[];

  // 转换为 Transfer 的数据源
  const dataSource = React.useMemo(() => {
    const level = componentType === ComponentType.List ? ButtonLevel.List : ButtonLevel.View;

    return map(buttons, (button: ActionButtonDto) => {
      return {
        key: button._id,
        /** 按钮等级过滤 */
        disabled: button.buttonLevel !== level,
        title: button.buttonName,
      };
    });
  }, [buttons, componentType]);

  const targetKeys = map(value, item => item._id);

  const handleChange = (newTargetKeys: React.Key[]) => {
    const selectedButtons = filter(buttons, button => includes(newTargetKeys, button._id));
    onChange?.(selectedButtons);
  };

  return (
    <Transfer
      oneWay
      titles={['可用按钮', '已选按钮']}
      dataSource={dataSource}
      targetKeys={targetKeys}
      onChange={handleChange}
      listStyle={{
        width: '100%',
        height: 220,
      }}
      render={item => `${item.title}`}
    />
  );
};

export default ComponentButtonSelect;
