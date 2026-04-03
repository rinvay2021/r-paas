import React from 'react';
import {
  Skeleton, Result, Tabs, Typography, Space, theme, Empty,
  Descriptions, Divider,
} from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { rendererApi } from '@/api/renderer';
import MetaActionButtons from '@/components/MetaActionButtons';
import MetaList from '@/components/MetaList';
import MetaSearchForm from '@/components/MetaSearchForm';
import type {
  DetailPageContainer, ListData, ViewData, SearchFormData,
  FormData, FormContainer, ContainerField,
} from '@/api/renderer/interface';

/** 用 Descriptions 渲染表单数据（只读详情模式） */
const FormDescriptions: React.FC<{ formData: FormData }> = ({ formData }) => {
  const globalColumns = formData.formConfig?.layoutSettings?.columns || 2;
  const containers = formData.containers || [];

  return (
    <>
      {containers.map((container: FormContainer, idx: number) => {
        if (container.isHidden) return null;
        const cols = container.columns || globalColumns;
        const fields = (container.fields || []) as ContainerField[];

        return (
          <div key={container.id} style={{ marginBottom: idx < containers.length - 1 ? 20 : 0 }}>
            {container.title && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <AppstoreOutlined style={{ color: '#1a1a1a', fontSize: 13 }} />
                <Typography.Text strong style={{ fontSize: 13, color: '#1a1a1a' }}>
                  {container.title}
                </Typography.Text>
              </div>
            )}
            <Descriptions
              bordered={false}
              column={cols}
              size="small"
              labelStyle={{ color: '#8c8c8c', width: 100, paddingRight: 8 }}
              contentStyle={{ color: '#262626', paddingBottom: 12 }}
            >
              {fields.map((field: ContainerField) => (
                <Descriptions.Item
                  key={field.fieldCode}
                  label={field.label || field.fieldName}
                >
                  {/* 详情页展示 mock 占位，实际应传入数据 */}
                  <span style={{ color: '#bfbfbf' }}>—</span>
                </Descriptions.Item>
              ))}
            </Descriptions>
            {idx < containers.length - 1 && <Divider style={{ margin: '4px 0 16px' }} />}
          </div>
        );
      })}
    </>
  );
};

const DetailPage: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const appCode = params.get('appCode') || '';
  const metaObjectCode = params.get('metaObjectCode') || '';
  const detailPageCode = params.get('detailPageCode') || '';

  const { data, loading, error } = useRequest(
    () => rendererApi.getDetail({ appCode, metaObjectCode, detailPageCode }),
    { ready: !!(appCode && metaObjectCode && detailPageCode) },
  );

  const { token } = theme.useToken();

  const detailData = data?.data;
  const mainForm = detailData?.mainForm;
  const buttons = detailData?.buttons || [];
  const containers = detailData?.detailPage?.containers || [];

  const mainContainer = containers.find((c: DetailPageContainer) => c.type === 'MAIN_OBJECT');
  const subContainers = containers.filter((c: DetailPageContainer) => c.type === 'SUB_OBJECT');

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Result status="error" title="加载失败" subTitle={error.message} />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {/* 主对象区域 */}
      <div
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
          padding: 20,
          marginBottom: 16,
        }}
      >
        {/* 标题 + 页级按钮 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {detailData?.detailPage?.detailPageName || '详情'}
          </Typography.Title>
          <Space>
            <MetaActionButtons
              buttons={[...buttons, ...(mainContainer?.buttons || [])]}
              level="page"
              onButtonClick={(btn) => console.log('main button:', btn)}
            />
          </Space>
        </div>

        {/* 主对象：用 Descriptions 展示 */}
        {mainForm ? (
          <FormDescriptions formData={mainForm} />
        ) : (
          <Empty description="未配置主对象表单" />
        )}
      </div>

      {/* 子对象 Tabs */}
      {subContainers.length > 0 && (
        <div
          style={{
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
            padding: 16,
          }}
        >
          <Tabs
            items={subContainers.map((sub: DetailPageContainer, idx: number) => ({
              key: String(idx),
              label: sub.title || `子对象 ${idx + 1}`,
              children: <SubObjectRenderer container={sub} />,
            }))}
          />
        </div>
      )}
    </div>
  );
};

/** 子对象渲染器 */
const SubObjectRenderer: React.FC<{ container: DetailPageContainer }> = ({ container }) => {
  if (!container.componentData) {
    return <Empty description="暂无数据" />;
  }

  if (container.componentType === 'List') {
    const listData = container.componentData as ListData;
    return (
      <div>
        {container.buttons && container.buttons.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <MetaActionButtons
              buttons={container.buttons}
              level="page"
              onButtonClick={(btn) => console.log('sub button:', btn)}
            />
          </div>
        )}
        <MetaList listData={listData} />
      </div>
    );
  }

  if (container.componentType === 'View') {
    const viewData = container.componentData as { view: ViewData; list: ListData; searchForm: SearchFormData };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {viewData.searchForm && (
          <MetaSearchForm
            searchFormData={viewData.searchForm}
            onSearch={(v) => console.log('sub search:', v)}
          />
        )}
        {container.buttons && container.buttons.length > 0 && (
          <MetaActionButtons
            buttons={container.buttons}
            level="page"
            onButtonClick={(btn) => console.log('sub button:', btn)}
          />
        )}
        {viewData.list && <MetaList listData={viewData.list} />}
      </div>
    );
  }

  return <Empty description="未知组件类型" />;
};

export default DetailPage;
