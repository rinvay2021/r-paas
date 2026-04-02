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
import { DetailPageDto } from '@/api/meta/interface';
import { META_PAGE_OFFSET, META_PAGE_TAB_HEIGHT } from '../../constant';
import DetailPageDesigner from './DetailPageDesigner';
import DetailPagePreview from './DetailPagePreview';
import type { DetailPageDesignerRef } from './DetailPageDesigner/types';

import './index.less';
import { useMetaFroms } from '@/store/metaFormAtom';
import {
  useMetaDetails,
  useCurrentDetail,
  useSetCurrentDetail,
  useLoadingDetails,
  useRefreshMetaDetails,
} from '@/store/metaDetailAtom';

const BaseDetail: React.FC = () => {
  const height = useElementHeight({
    elementId: 'meta-page-container',
    offset: META_PAGE_OFFSET,
  });

  const { appCode, metaObjectCode } = useMeta();

  const forms = useMetaFroms();
  const details = useMetaDetails();
  const loading = useLoadingDetails();
  const activeDetail = useCurrentDetail();
  const setActiveDetail = useSetCurrentDetail();
  const refreshTrigger = useRefreshMetaDetails();

  const editingDetailRef = React.useRef<DetailPageDto | null>(null);
  const detailDesignerRef = React.useRef<DetailPageDesignerRef>(null);

  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [isEditing, { setTrue: setEditing, setFalse: setPreview }] = useBoolean(false);

  const handleDeleteDetail = useMemoizedFn(async () => {
    try {
      await metaService.deleteDetailPage(activeDetail._id);
      message.success('删除成功');
      refreshTrigger();
    } catch (error) {
      message.error('删除失败');
    }
  });

  const handleSaveDetail = useMemoizedFn(() => {
    detailDesignerRef.current?.saveDetail?.();
  });

  const handleSettingDetail = useMemoizedFn(() => {
    const filter = detail => detail.detailPageCode === activeDetail?.detailPageCode;
    const editingDetail = find(details, filter);

    if (!editingDetail) {
      message.info('详情页不存在');
      return;
    }

    editingDetailRef.current = editingDetail;
    setDetailModalOpen(true);
  });

  const onActiveDetailChange = useMemoizedFn((detailCode: string) => {
    const filter = detail => detail?.detailPageCode === detailCode;
    const activeDetail = find(details, filter);

    if (!activeDetail) {
      message.info('详情页不存在');
      return;
    }

    setActiveDetail(activeDetail);
    setPreview();
  });

  const items = React.useMemo(() => {
    return map(details, detail => ({
      key: detail?.detailPageCode,
      label: detail?.detailPageName,
      children: null,
    }));
  }, [details]);

  const formOptions = React.useMemo(() => {
    return map(forms, form => ({
      value: form?.formCode,
      label: form?.formName,
    }));
  }, [forms]);

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
          <Empty description="暂无详情页，去添加一个吧">
            <Button type="default" onClick={() => setDetailModalOpen(true)}>
              新建详情页
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
          activeKey={activeDetail?.detailPageCode}
          onChange={onActiveDetailChange}
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
                    editingDetailRef.current = null;
                    setDetailModalOpen(true);
                  }}
                >
                  新建详情页
                </Button>
                {isEditing && (
                  <>
                    <Button type="dashed" onClick={setPreview}>
                      取消
                    </Button>
                    <Button color="default" variant="outlined" onClick={handleSaveDetail}>
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
            ref={detailDesignerRef}
            refresh={refreshTrigger}
            height={height}
            activeDetail={activeDetail}
          />
        ) : (
          <DetailPagePreview
            height={height}
            onEdit={setEditing}
            onDelete={handleDeleteDetail}
            onSetting={handleSettingDetail}
          />
        )}
      </>
    );
  };

  return (
    <div className={`${prefix}-base-detail`}>
      {/* 详情页内容 */}
      {renderContent()}

      {/* 新建/编辑详情页的表单 */}
      <ModalForm<DetailPageDto>
        title={editingDetailRef.current ? '编辑详情页' : '新建详情页'}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            editingDetailRef.current = null;
            setDetailModalOpen(false);
          },
        }}
        initialValues={editingDetailRef.current || undefined}
        onFinish={async values => {
          try {
            if (editingDetailRef.current) {
              await metaService.updateDetailPage({
                ...values,
                _id: editingDetailRef.current._id,
              });
              message.success('更新成功');
            } else {
              await metaService.createDetailPage({
                ...values,
                appCode,
                metaObjectCode,
              });
              message.success('创建成功');
            }

            refreshTrigger();
            editingDetailRef.current = null;
            return true;
          } catch (error) {
            const errorMessage = get(error, 'message', '操作失败');
            message.error(errorMessage);
            return false;
          }
        }}
      >
        <ProFormText
          name="detailPageName"
          label="详情页名称"
          placeholder="请输入详情页名称"
          rules={[
            { required: true, message: '请输入详情页名称' },
            { max: 50, message: '详情页名称不能超过50个字符' },
          ]}
        />
        <ProFormText
          name="detailPageCode"
          label="详情页编码"
          placeholder="请输入详情页编码"
          disabled={!!editingDetailRef.current}
          rules={[
            { required: true, message: '请输入表单编码' },
            {
              pattern: /^[A-Z][a-zA-Z0-9_]*$/,
              message: '以大写字母开头，只能包含字母、数字和下划线',
            },
            { max: 30, message: '详情页编码不能超过30个字符' },
          ]}
        />
        <ProFormSelect
          name="formCode"
          label="基础表单"
          options={formOptions}
          rules={[{ required: true, message: '请选择基础表单' }]}
        />
        <ProFormTextArea
          name="detailPageDesc"
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

export default BaseDetail;
