import React from 'react';
import { find, get, map } from 'lodash';
import { useBoolean, useMemoizedFn } from 'ahooks';
import { Button, Empty, Flex, message, Modal, Space, Spin, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';

import { prefix } from '@/constant';
import { useElementHeight } from '@/hooks';
import { useMeta } from '@/store/metaAtom';
import { metaService } from '@/api/meta';
import { DetailPageDto, ListDto } from '@/api/meta/interface';
import { META_PAGE_OFFSET, META_PAGE_TAB_HEIGHT } from '../../constant';
import DetailPageDesigner from './ListDesigner';
import DetailPagePreview from './ListPreview';
import type { ListDesignerRef } from './ListDesigner/types';
import {
  useMetaLists,
  useLoadingLists,
  useCurrentList,
  useSetCurrentList,
  useRefreshMetaLists,
} from '@/store/metaListAtom';

import './index.less';

const BaseList: React.FC = () => {
  const height = useElementHeight({
    elementId: 'meta-page-container',
    offset: META_PAGE_OFFSET,
  });

  const { appCode, metaObjectCode } = useMeta();

  const lists = useMetaLists();
  const loading = useLoadingLists();
  const activeList = useCurrentList();
  const setActiveList = useSetCurrentList();
  const refreshTrigger = useRefreshMetaLists();

  const editingListRef = React.useRef<ListDto | null>(null);
  const listDesignerRef = React.useRef<ListDesignerRef>(null);

  const [listModalOpen, setListModalOpen] = React.useState(false);
  const [isEditing, { setTrue: setEditing, setFalse: setPreview }] = useBoolean(false);

  const handleDeleteList = useMemoizedFn(async () => {
    try {
      await metaService.deleteList(activeList._id);
      message.success('删除成功');
      refreshTrigger();
    } catch (error) {
      message.error('删除失败');
    }
  });

  const handleSaveList = useMemoizedFn(() => {
    listDesignerRef.current?.saveList?.();
  });

  const handleSettingList = useMemoizedFn(() => {
    const filter = list => list.listCode === activeList?.listCode;
    const editingList = find(lists, filter);

    if (!editingList) {
      message.info('列表不存在');
      return;
    }

    editingListRef.current = editingList;
    setListModalOpen(true);
  });

  const onActiveListChange = useMemoizedFn((listCode: string) => {
    const filter = list => list?.listCode === listCode;
    const activeList = find(lists, filter);

    if (!activeList) {
      message.info('列表不存在');
      return;
    }

    setActiveList(activeList);
    setPreview();
  });

  const items = React.useMemo(() => {
    return map(lists, list => ({
      key: list?.listCode,
      label: list?.listName,
      children: null,
    }));
  }, [lists]);

  const renderContent = () => {
    if (loading) {
      return <Spin spinning={loading} />;
    }

    if (items.length === 0) {
      return (
        <Flex
          align="center"
          justify="center"
          style={{ height: `${height + META_PAGE_TAB_HEIGHT}px` }}
        >
          <Empty description="暂无列表页，去添加一个吧">
            <Button type="default" onClick={() => setListModalOpen(true)}>
              新建列表
            </Button>
          </Empty>
        </Flex>
      );
    }

    return (
      <>
        <Tabs
          size="small"
          items={items}
          activeKey={activeList?.listCode}
          onChange={onActiveListChange}
          indicator={{ size: () => 20 }}
          className={`${prefix}-base-detail-tabs`}
          tabBarExtraContent={{
            right: (
              <Space>
                <Button
                  type="dashed"
                  loading={loading}
                  icon={<PlusOutlined />}
                  onClick={() => {
                    editingListRef.current = null;
                    setListModalOpen(true);
                  }}
                >
                  新建列表
                </Button>
                {isEditing && (
                  <>
                    <Button type="dashed" onClick={setPreview}>
                      取消
                    </Button>
                    <Button color="default" variant="outlined" onClick={handleSaveList}>
                      保存
                    </Button>
                  </>
                )}
              </Space>
            ),
          }}
        />
        {isEditing ? (
          <DetailPageDesigner
            ref={listDesignerRef}
            refresh={refreshTrigger}
            height={height}
            activeList={activeList}
          />
        ) : (
          <DetailPagePreview
            height={height}
            onEdit={setEditing}
            onDelete={handleDeleteList}
            onSetting={handleSettingList}
          />
        )}
      </>
    );
  };

  return (
    <div className={`${prefix}-base-detail`}>
      {/* 详情页内容 */}
      {renderContent()}

      {/* 新建/编辑列表的表单 */}
      <ModalForm<DetailPageDto>
        title={editingListRef.current ? '编辑列表' : '新建列表'}
        open={listModalOpen}
        onOpenChange={setListModalOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            editingListRef.current = null;
            setListModalOpen(false);
          },
        }}
        initialValues={editingListRef.current || undefined}
        onFinish={async values => {
          try {
            if (editingListRef.current) {
              await metaService.updateList({
                ...values,
                _id: editingListRef.current._id,
              });
              message.success('更新成功');
            } else {
              await metaService.createList({
                ...values,
                appCode,
                metaObjectCode,
              });
              message.success('创建成功');
            }

            refreshTrigger();
            editingListRef.current = null;
            return true;
          } catch (error) {
            const errorMessage = get(error, 'message', '操作失败');
            message.error(errorMessage);
            return false;
          }
        }}
      >
        <ProFormText
          name="listName"
          label="列表名称"
          placeholder="请输入列表名称"
          rules={[
            { required: true, message: '请输入列表名称' },
            { max: 50, message: '列表名称不能超过50个字符' },
          ]}
        />
        <ProFormText
          name="listCode"
          label="列表编码"
          placeholder="请输入列表编码"
          disabled={!!editingListRef.current}
          rules={[
            { required: true, message: '请输入列表编码' },
            {
              pattern: /^[A-Z][a-zA-Z0-9_]*$/,
              message: '以大写字母开头，只能包含字母、数字和下划线',
            },
            { max: 30, message: '列表编码不能超过30个字符' },
          ]}
        />
        <ProFormTextArea
          name="listDesc"
          label="描述"
          placeholder="请输入描述信息"
          fieldProps={{
            maxLength: 200,
            showCount: true,
            rows: 4,
          }}
        />
      </ModalForm>
    </div>
  );
};

export default BaseList;
