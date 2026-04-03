import React from 'react';
import type { MouseEvent } from 'react';
import { Modal, Empty, Spin } from 'antd';
import { map, filter, includes, get } from 'lodash';
import { useRequest } from 'ahooks';
import { Transfer } from 'antd';
import { useMeta } from '@/store/metaAtom';
import { metaService } from '@/api/meta';
import { ActionButtonDto } from '@/api/meta/interface';
import { ButtonLevel } from '@/pages/meta/components/FunctionButton/type';
// import { ComponentType } from '@/pages/meta/components/BaseDetail/types';
import { ButtonSelectorModalProps } from './type';

const ButtonSelectorModal: React.FC<ButtonSelectorModalProps> = ({
  children,
  value = [],
  onChange,
}) => {
  const [open, setOpen] = React.useState(false);
  const { appCode, metaObjectCode } = useMeta();

  // 动态查询该对象的所有按钮
  const { data: buttonData, loading } = useRequest(
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
      cacheKey: `button-selector-${appCode}-${metaObjectCode}`,
      refreshDeps: [appCode, metaObjectCode],
    }
  );

  const buttons = get(buttonData, 'data.list', []) as ActionButtonDto[];

  const handleTriggerClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleOk = () => {
    setOpen(false);
  };

  const targetKeys = React.useMemo(() => {
    return map(value, item => item._id);
  }, [value]);

  const dataSource = React.useMemo(() => {
    return map(buttons, (button: ActionButtonDto) => {
      return {
        key: button._id,
        /** 按钮等级过滤 */
        disabled: !includes([ButtonLevel.List, ButtonLevel.ListRow], button.buttonLevel),
        title: button.buttonName,
      };
    });
  }, [buttons]);

  const handleTransferChange = (newTargetKeys: React.Key[]) => {
    const selectedButtons = filter(buttons, button => includes(newTargetKeys, button._id));
    onChange?.(selectedButtons);
  };

  if (!appCode || !metaObjectCode) {
    return <Empty description="缺少必要参数：appCode 或 metaObjectCode" />;
  }

  return (
    <>
      <span onClick={handleTriggerClick}>{children}</span>

      <Modal
        open={open}
        onCancel={handleCancel}
        onOk={handleOk}
        title="按钮选择"
        destroyOnClose
        width={800}
      >
        {loading ? (
          <Spin />
        ) : (
          <Transfer
            oneWay
            titles={['可用按钮', '已选按钮']}
            dataSource={dataSource}
            targetKeys={targetKeys}
            onChange={handleTransferChange}
            listStyle={{
              width: '100%',
              height: 300,
            }}
            render={item => `${item.title}`}
          />
        )}
      </Modal>
    </>
  );
};

export default ButtonSelectorModal;
