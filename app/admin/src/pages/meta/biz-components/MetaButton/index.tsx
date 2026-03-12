import React from 'react';
import { useMemoizedFn } from 'ahooks';
import type { TransferProps } from 'antd';
import { Transfer, Empty, Spin } from 'antd';
import { map, filter, includes } from 'lodash';
import { useMeta } from '@/store/metaAtom';
import { useMetaButtons, useLoadingButtons } from '@/store/metaButtons';
import { ActionButtonDto } from '@/api/meta/interface';
import { ButtonLevel } from '@/pages/meta/components/FunctionButton/type';

import './index.less';

interface ButtonSelectorProps {
  value?: ActionButtonDto[];
  level?: ButtonLevel;
  onChange?: (selectedButtons: ActionButtonDto[]) => void;
  disabled?: boolean;
}

export const ButtonSelector: React.FC<ButtonSelectorProps> = props => {
  const { value = [], onChange, level, disabled = false } = props;
  const { appCode, metaObjectCode } = useMeta();

  const buttons = useMetaButtons();
  const loading = useLoadingButtons();

  const handleChange: TransferProps['onChange'] = useMemoizedFn(selectedKeys => {
    const updateButtons = filter(buttons, button => includes(selectedKeys, button._id));
    onChange?.(updateButtons);
  });

  if (!appCode || !metaObjectCode) {
    return <Empty description="缺少必要参数：appCode 或 metaObjectCode" />;
  }

  if (loading) {
    return <Spin />;
  }

  const targetKeys = React.useMemo(() => {
    return map(value, item => item._id);
  }, [value]);

  const dataSource = React.useMemo(() => {
    return map(buttons, (button: ActionButtonDto) => {
      return {
        key: button._id,
        /** 按钮等级过滤 */
        disabled: button.buttonLevel !== level,
        title: button.buttonName,
      };
    });
  }, [buttons]);

  return (
    <Transfer
      oneWay
      titles={['可用按钮', '已选按钮']}
      disabled={disabled}
      targetKeys={targetKeys}
      dataSource={dataSource}
      onChange={handleChange}
      listStyle={{
        width: '100%',
        height: 220,
      }}
      render={item => `${item.title}`}
    />
  );
};
