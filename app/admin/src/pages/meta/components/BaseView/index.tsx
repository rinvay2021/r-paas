import React from 'react';
import { find, get, map } from 'lodash';
import { useBoolean, useMemoizedFn } from 'ahooks';
import { Button, Empty, Flex, message, Modal, Space, Spin, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';

import { prefix } from '@/constant';
import { useElementHeight } from '@/hooks';
import { useMeta } from '@/store/metaAtom';
import { metaService } from '@/api/meta';
import { ViewDto } from '@/api/meta/interface';
import { META_PAGE_OFFSET, META_PAGE_TAB_HEIGHT } from '../../constant';
import ViewDesigner from './ViewDesigner';
import ViewPreview from './ViewPreview';
import { useMetaLists } from '@/store/metaListAtom';
import { useMetaSearchForms } from '@/store/metaSearchFormAtom';
import {
  useMetaViews,
  useCurrentView,
  useSetCurrentView,
  useLoadingViews,
  useRefreshMetaViews,
} from '@/store/metaViewAtom';

import './index.less';
import type { ViewDesignerRef } from './ViewDesigner/types';

const BaseView: React.FC = () => {
  const height = useElementHeight({
    elementId: 'meta-page-container',
    offset: META_PAGE_OFFSET,
  });

  const { appCode, metaObjectCode } = useMeta();

  const lists = useMetaLists();
  const searchForms = useMetaSearchForms();
  const views = useMetaViews();
  const loading = useLoadingViews();
  const activeView = useCurrentView();
  const setActiveView = useSetCurrentView();
  const refreshTrigger = useRefreshMetaViews();

  const editingViewRef = React.useRef<ViewDto | null>(null);
  const viewDesignerRef = React.useRef<ViewDesignerRef>(null);

  const [viewModalOpen, setViewModalOpen] = React.useState(false);
  const [isEditing, { setTrue: setEditing, setFalse: setPreview }] = useBoolean(false);

  const handleDeleteView = useMemoizedFn(() => {
    if (!activeView?._id) {
      message.info('请先选择要删除的视图');
      return;
    }

    Modal.confirm({
      title: '删除确认',
      content: '确定要删除该视图吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await metaService.deleteView(activeView._id);
          message.success('删除成功');
          refreshTrigger();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  });

  const handleSaveView = useMemoizedFn(async () => {
    await viewDesignerRef.current?.saveView?.();
  });

  const handleSettingView = useMemoizedFn(() => {
    const filter = (view: ViewDto) => view.viewCode === activeView?.viewCode;
    const editingView = find(views, filter);

    if (!editingView) {
      message.info('视图不存在');
      return;
    }

    editingViewRef.current = editingView;
    setViewModalOpen(true);
  });

  const onActiveViewChange = useMemoizedFn((viewCode: string) => {
    const filter = (view: ViewDto) => view?.viewCode === viewCode;
    const view = find(views, filter);

    if (!view) {
      message.info('视图不存在');
      return;
    }

    setActiveView(view);
    setPreview();
  });

  const items = React.useMemo(() => {
    return map(views, view => ({
      key: view?.viewCode,
      label: view?.viewName,
      children: null,
    }));
  }, [views]);

  const listOptions = React.useMemo(() => {
    return map(lists, list => ({
      value: list?.listCode,
      label: list?.listName,
    }));
  }, [lists]);

  const searchFormOptions = React.useMemo(() => {
    return map(searchForms, form => ({
      value: form?.searchFormCode,
      label: form?.searchFormName,
    }));
  }, [searchForms]);

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
          <Empty description="暂无视图，去添加一个吧">
            <Button type="default" onClick={() => setViewModalOpen(true)}>
              新建视图
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
          activeKey={activeView?.viewCode}
          onChange={onActiveViewChange}
          indicator={{ size: () => 20 }}
          className={`${prefix}-base-view-tabs`}
          tabBarExtraContent={{
            right: (
              <Space>
                <Button
                  type="dashed"
                  loading={loading}
                  icon={<PlusOutlined />}
                  onClick={() => {
                    editingViewRef.current = null;
                    setViewModalOpen(true);
                  }}
                >
                  新建视图
                </Button>
                {isEditing && (
                  <>
                    <Button type="dashed" onClick={setPreview}>
                      取消
                    </Button>
                    <Button color="default" variant="outlined" onClick={handleSaveView}>
                      保存
                    </Button>
                  </>
                )}
              </Space>
            ),
          }}
        />
        {isEditing ? (
          <ViewDesigner
            ref={viewDesignerRef}
            height={height}
            activeView={activeView}
            refresh={refreshTrigger}
          />
        ) : (
          <ViewPreview
            height={height}
            appCode={appCode}
            metaObjectCode={metaObjectCode}
            viewCode={activeView?.viewCode}
            onEdit={setEditing}
            onDelete={handleDeleteView}
            onSetting={handleSettingView}
          />
        )}
      </>
    );
  };

  return (
    <div className={`${prefix}-base-view`}>
      {/* 视图内容 */}
      {renderContent()}

      {/* 新建/编辑视图的表单 */}
      <ModalForm<ViewDto>
        title={editingViewRef.current ? '编辑视图' : '新建视图'}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            editingViewRef.current = null;
            setViewModalOpen(false);
          },
        }}
        initialValues={editingViewRef.current || undefined}
        onFinish={async values => {
          try {
            if (editingViewRef.current) {
              await metaService.updateView({
                ...values,
                _id: editingViewRef.current._id,
              });
              message.success('更新成功');
            } else {
              await metaService.createView({
                ...values,
                appCode,
                metaObjectCode,
              });
              message.success('创建成功');
            }

            refreshTrigger();
            editingViewRef.current = null;
            return true;
          } catch (error) {
            const errorMessage = get(error, 'message', '操作失败');
            message.error(errorMessage);
            return false;
          }
        }}
      >
        <ProFormText
          name="viewName"
          label="视图名称"
          placeholder="请输入视图名称"
          rules={[
            { required: true, message: '请输入视图名称' },
            { max: 50, message: '视图名称不能超过50个字符' },
          ]}
        />
        <ProFormText
          name="viewCode"
          label="视图编码"
          placeholder="请输入视图编码"
          disabled={!!editingViewRef.current}
          rules={[
            { required: true, message: '请输入视图编码' },
            {
              pattern: /^[A-Z][a-zA-Z0-9_]*$/,
              message: '以大写字母开头，只能包含字母、数字和下划线',
            },
            { max: 30, message: '视图编码不能超过30个字符' },
          ]}
        />
        <ProFormSelect
          name="searchFormCode"
          label="搜索表单"
          options={searchFormOptions}
          placeholder="请选择搜索表单"
          rules={[{ required: true, message: '请选择搜索表单' }]}
        />
        <ProFormSelect
          name="listCode"
          label="列表"
          options={listOptions}
          placeholder="请选择列表"
          rules={[{ required: true, message: '请选择列表' }]}
        />
        <ProFormTextArea
          name="viewDesc"
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

export default BaseView;
