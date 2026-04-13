import React from 'react';
import {
  Skeleton,
  Result,
  Tabs,
  Typography,
  Space,
  theme,
  Empty,
  Descriptions,
  Divider,
} from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { rendererApi } from '@/api/renderer';
import { dataApi } from '@/api/data';
import { datasourceApi } from '@/api/datasource';
import MetaActionButtons from '@/components/MetaActionButtons';
import MetaList from '@/components/MetaList';
import MetaView from '@/components/MetaView';
import type {
  DetailPageContainer,
  ListData,
  ViewData,
  SearchFormData,
  FormData,
  FormContainer,
  ContainerField,
  ActionButton,
} from '@/api/renderer/interface';
import { DetailComponentType, DetailPageType, FieldType } from '@r-paas/meta';

const DATASOURCE_FIELD_TYPES = [
  FieldType.SingleSelect,
  FieldType.MultipleSelect,
  FieldType.SingleRadio,
  FieldType.MultipleCheckbox,
  FieldType.TreeSelect,
  FieldType.Cascader,
];

function formatFieldValue(
  value: any,
  fieldType?: string,
  options?: { label: string; value: string }[]
): React.ReactNode {
  if (value === null || value === undefined || value === '') {
    return <span style={{ color: '#bfbfbf' }}>—</span>;
  }
  if (options && options.length > 0) {
    if (Array.isArray(value)) {
      return value.map(v => options.find(o => o.value === v)?.label ?? v).join('、');
    }
    return options.find(o => o.value === String(value))?.label ?? String(value);
  }
  if (
    fieldType === FieldType.DatePicker ||
    fieldType === FieldType.MonthPicker ||
    fieldType === FieldType.YearPicker
  ) {
    try {
      return new Date(value).toLocaleDateString('zh-CN');
    } catch {
      return String(value);
    }
  }
  if (fieldType === FieldType.TimePicker) {
    try {
      return new Date(value).toLocaleTimeString('zh-CN');
    } catch {
      return String(value);
    }
  }
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (Array.isArray(value)) return value.join('、');
  return String(value);
}

const FormDescriptions: React.FC<{
  formData: FormData;
  record: Record<string, any> | null;
  optionsMap: Record<string, { label: string; value: string }[]>;
}> = ({ formData, record, optionsMap }) => {
  const globalColumns = formData.formConfig?.layoutSettings?.columns || 2;

  return (
    <>
      {(formData.containers || []).map((container: FormContainer, idx: number) => {
        if (container.isHidden) return null;
        const cols = container.columns || globalColumns;
        const fields = (container.fields || []) as ContainerField[];

        return (
          <div
            key={container.id || idx}
            style={{ marginBottom: idx < (formData.containers?.length ?? 0) - 1 ? 20 : 0 }}
          >
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
              {fields.map((field: ContainerField) => {
                const ft = (field as any).fieldType as string | undefined;
                const datasourceCode = (field as any).config?.datasourceCode as string | undefined;
                const inlineOptions = (field as any).config?.options as
                  | { label: string; value: string }[]
                  | undefined;
                const opts = datasourceCode ? optionsMap[datasourceCode] : inlineOptions;
                return (
                  <Descriptions.Item key={field.fieldCode} label={field.label || field.fieldName}>
                    {formatFieldValue(record?.[field.fieldCode], ft, opts)}
                  </Descriptions.Item>
                );
              })}
            </Descriptions>
            {idx < (formData.containers?.length ?? 0) - 1 && (
              <Divider style={{ margin: '4px 0 16px' }} />
            )}
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
  const recordId = params.get('recordId') || '';

  // 元数据
  const {
    data: metaData,
    loading: metaLoading,
    error,
  } = useRequest(() => rendererApi.getDetail({ appCode, metaObjectCode, detailPageCode }), {
    ready: !!(appCode && metaObjectCode && detailPageCode),
  });

  // 记录数据
  const {
    data: recordData,
    loading: recordLoading,
    refresh: refreshRecord,
  } = useRequest(() => dataApi.detail({ appCode, metaObjectCode, id: recordId }), {
    ready: !!(appCode && metaObjectCode && recordId),
  });

  const loading = metaLoading || recordLoading;
  const { token } = theme.useToken();

  const detailData = metaData?.data;
  const containers: DetailPageContainer[] = (detailData?.containers || []) as DetailPageContainer[];
  const record = recordData?.data || null;

  // 第一个 container 是主对象，其余是子对象
  const mainContainer = containers[0] as any;
  const subContainers = containers.slice(1).filter((c: any) => c.isVisible !== false);

  const mainFormData: FormData | null = mainContainer?.formData || null;
  const mainButtons: ActionButton[] = mainContainer?.buttons || [];
  const pageType = mainContainer?.pageType;

  // 数据源 options
  const [optionsMap, setOptionsMap] = React.useState<
    Record<string, { label: string; value: string }[]>
  >({});
  React.useEffect(() => {
    if (!mainFormData || !appCode) return;
    const allFields = (mainFormData.containers || []).flatMap((c: any) => c.fields || []);
    const datasourceCodes = [
      ...new Set(
        allFields
          .filter(
            (f: any) => DATASOURCE_FIELD_TYPES.includes(f.fieldType) && f.config?.datasourceCode
          )
          .map((f: any) => f.config.datasourceCode as string)
      ),
    ];
    if (!datasourceCodes.length) return;
    datasourceApi
      .batchOptions({ appCode, datasourceCodes })
      .then(res => {
        if (res?.data) setOptionsMap(res.data);
      })
      .catch(() => {});
  }, [mainFormData, appCode]);

  // 详情页 afterAction：刷新记录数据
  const afterAction = React.useCallback(() => {
    refreshRecord();
  }, [refreshRecord]);

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

  const titleBar = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      <Typography.Title level={5} style={{ margin: 0 }}>
        {detailData?.detailPageName || '详情'}
      </Typography.Title>
      <Space>
        <MetaActionButtons
          buttons={mainButtons}
          variant="block"
          mode="detail"
          record={record || {}}
          afterAction={afterAction}
        />
      </Space>
    </div>
  );

  // TagTiled：主对象一个 Tab，每个子对象一个 Tab
  if (pageType === DetailPageType.TagTiled) {
    const tabItems = [
      {
        key: 'main',
        label: detailData?.detailPageName || '基本信息',
        children: mainFormData ? (
          <FormDescriptions formData={mainFormData} record={record} optionsMap={optionsMap} />
        ) : (
          <Empty description="未配置主对象表单" />
        ),
      },
      ...subContainers.map((sub: DetailPageContainer, idx: number) => ({
        key: `sub-${idx}`,
        label: (sub as any).title || `子对象 ${idx + 1}`,
        children: <SubObjectRenderer container={sub} />,
      })),
    ];

    return (
      <div style={{ padding: 20 }}>
        <div
          style={{
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
            padding: 20,
          }}
        >
          {titleBar}
          <Tabs items={tabItems} />
        </div>
      </div>
    );
  }

  // OnePage（默认）：垂直堆叠
  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
          padding: 20,
          marginBottom: subContainers.length > 0 ? 16 : 0,
        }}
      >
        {titleBar}
        {mainFormData ? (
          <FormDescriptions formData={mainFormData} record={record} optionsMap={optionsMap} />
        ) : (
          <Empty description="未配置主对象表单" />
        )}
      </div>

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
              label: (sub as any).title || `子对象 ${idx + 1}`,
              children: <SubObjectRenderer container={sub} />,
            }))}
          />
        </div>
      )}
    </div>
  );
};

const SubObjectRenderer: React.FC<{ container: DetailPageContainer }> = ({ container }) => {
  if (!container.componentData) return <Empty description="暂无数据" />;

  const overrideButtons =
    container.buttons && container.buttons.length > 0 ? container.buttons : undefined;

  if (container.componentType === DetailComponentType.List) {
    return (
      <MetaList
        listData={container.componentData as ListData}
        overrideButtons={overrideButtons}
        fixedHeight={0}
      />
    );
  }

  if (container.componentType === DetailComponentType.View) {
    const viewData = container.componentData as {
      view: ViewData;
      list: ListData;
      searchForm: SearchFormData;
    };
    // appCode/metaObjectCode 已在 viewData.list/view 元数据里，MetaView 内部自取
    return <MetaView viewData={viewData} overrideButtons={overrideButtons} fixedHeight={0} />;
  }

  return <Empty description="未知组件类型" />;
};

export default DetailPage;
