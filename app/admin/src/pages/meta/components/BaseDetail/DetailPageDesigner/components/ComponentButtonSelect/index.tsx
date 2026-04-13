import React from 'react';
import { map, get, filter, includes } from 'lodash';
import { useRequest } from 'ahooks';
import { Transfer } from 'antd';
import { metaService } from '@/api/meta';
import { useMeta } from '@/store/metaAtom';
import { ActionButtonDto } from '@/api/meta/interface';
import { ButtonLevel } from '@r-paas/meta';
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

  // 转换为 Transfer 的数据源，列表类型同时支持 List 和 ListRow 级别
  const dataSource = React.useMemo(() => {
    const allowedLevels = componentType === ComponentType.List
      ? [ButtonLevel.List, ButtonLevel.ListRow]
      : [ButtonLevel.View];

    return map(buttons, (button: ActionButtonDto) => {
      return {
        key: button._id,
        disabled: !allowedLevels.includes(button.buttonLevel as ButtonLevel),
        title: `${button.buttonName}（${button.buttonLevel}）`,
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
