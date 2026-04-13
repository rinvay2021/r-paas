import React from 'react';
import dayjs from 'dayjs';
import {
  Form,
  Row,
  Col,
  Button,
  Input,
  InputNumber,
  DatePicker,
  TimePicker,
  Select,
  TreeSelect,
  Cascader,
  Space,
  theme,
  Tooltip,
} from 'antd';
import { SearchOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import type { SearchFormData, SearchFormField } from '@/api/renderer/interface';
import { FieldType, SqlConditionOperator as Cond } from '@r-paas/meta';
import { datasourceApi } from '@/api/datasource';

interface MetaSearchFormProps {
  searchFormData: SearchFormData;
  onSearch?: (values: Record<string, any>) => void;
  appCode?: string;
}

const isRange = (c: string) => c === Cond.BETWEEN;
const isMulti = (c: string) => c === Cond.IN || c === Cond.NOT_IN;
const isNoInput = (c: string) => c === Cond.IS_NULL || c === Cond.IS_NOT_NULL;

/** 渲染搜索控件，范围控件也只占 1 列 */
function renderSearchControl(
  sf: SearchFormField,
  optionsMap: Record<string, { label: string; value: string }[]>
): React.ReactNode {
  const fieldType = sf.fieldInfo?.fieldType || 'Text';
  const condition = sf.condition || Cond.EQUAL;
  const placeholder = sf.placeholder || `请输入${sf.displayName || sf.fieldName}`;
  const dsCode = sf.fieldInfo?.config?.datasourceCode;
  const options = (dsCode ? optionsMap[dsCode] : null) || sf.fieldInfo?.config?.options || [];

  if (isNoInput(condition)) {
    return <Input disabled placeholder="无需输入" style={{ width: '100%' }} />;
  }

  const popupContainer = (trigger: HTMLElement) => trigger.parentElement!;

  if (fieldType === FieldType.DatePicker) {
    if (isRange(condition))
      return (
        <DatePicker.RangePicker style={{ width: '100%' }} getPopupContainer={popupContainer} />
      );
    return <DatePicker style={{ width: '100%' }} getPopupContainer={popupContainer} />;
  }
  if (fieldType === FieldType.MonthPicker) {
    if (isRange(condition))
      return (
        <DatePicker.RangePicker
          style={{ width: '100%' }}
          picker="month"
          getPopupContainer={popupContainer}
        />
      );
    return (
      <DatePicker style={{ width: '100%' }} picker="month" getPopupContainer={popupContainer} />
    );
  }
  if (fieldType === FieldType.YearPicker) {
    if (isRange(condition))
      return (
        <DatePicker.RangePicker
          style={{ width: '100%' }}
          picker="year"
          getPopupContainer={popupContainer}
        />
      );
    return (
      <DatePicker style={{ width: '100%' }} picker="year" getPopupContainer={popupContainer} />
    );
  }
  if (fieldType === FieldType.TimePicker) {
    if (isRange(condition))
      return (
        <TimePicker.RangePicker style={{ width: '100%' }} getPopupContainer={popupContainer} />
      );
    return <TimePicker style={{ width: '100%' }} getPopupContainer={popupContainer} />;
  }

  if (fieldType === FieldType.Text_Number) {
    if (isRange(condition)) {
      return (
        <Input.Group compact style={{ display: 'flex' }}>
          <InputNumber style={{ flex: 1, minWidth: 0 }} placeholder="最小" />
          <Input
            style={{ width: 24, textAlign: 'center', pointerEvents: 'none', padding: '0 4px' }}
            placeholder="~"
            disabled
          />
          <InputNumber style={{ flex: 1, minWidth: 0 }} placeholder="最大" />
        </Input.Group>
      );
    }
    return <InputNumber style={{ width: '100%' }} placeholder={placeholder} />;
  }

  if (fieldType === FieldType.SingleSelect || fieldType === FieldType.SingleRadio) {
    if (isMulti(condition)) {
      return (
        <Select
          style={{ width: '100%' }}
          mode="multiple"
          placeholder={placeholder}
          options={options}
          allowClear
        />
      );
    }
    return (
      <Select style={{ width: '100%' }} placeholder={placeholder} options={options} allowClear />
    );
  }

  if (fieldType === FieldType.MultipleSelect || fieldType === FieldType.MultipleCheckbox) {
    return (
      <Select
        style={{ width: '100%' }}
        mode="multiple"
        placeholder={placeholder}
        options={options}
        allowClear
      />
    );
  }

  if (fieldType === FieldType.TreeSelect) {
    const treeData = sf.fieldInfo?.config?.treeData || [];
    return (
      <TreeSelect
        style={{ width: '100%' }}
        placeholder={placeholder}
        treeData={treeData}
        allowClear
      />
    );
  }
  if (fieldType === FieldType.Cascader) {
    return (
      <Cascader style={{ width: '100%' }} placeholder={placeholder} options={options} allowClear />
    );
  }

  return <Input placeholder={placeholder} allowClear />;
}

const DATE_FIELD_TYPES = [
  FieldType.DatePicker,
  FieldType.MonthPicker,
  FieldType.YearPicker,
  FieldType.TimePicker,
];

function parseDateValue(value: any, fieldType: string, condition: string): any {
  if (!value || !DATE_FIELD_TYPES.includes(fieldType as any)) return value;
  if (isRange(condition) && Array.isArray(value)) {
    return value.map(v => (v ? dayjs(v) : null));
  }
  return typeof value === 'string' && value ? dayjs(value) : value;
}

function buildInitialValues(fields: SearchFormField[]): Record<string, any> {
  const values: Record<string, any> = {};
  fields.forEach(sf => {
    if (
      sf.defaultValueType === 'custom' &&
      sf.defaultValue !== undefined &&
      sf.defaultValue !== ''
    ) {
      const fieldType = sf.fieldInfo?.fieldType || 'Text';
      values[sf.fieldName] = parseDateValue(sf.defaultValue, fieldType, sf.condition);
    }
  });
  return values;
}

const DATASOURCE_FIELD_TYPES = [
  FieldType.SingleSelect,
  FieldType.MultipleSelect,
  FieldType.SingleRadio,
  FieldType.MultipleCheckbox,
  FieldType.TreeSelect,
  FieldType.Cascader,
];

const MetaSearchForm: React.FC<MetaSearchFormProps> = ({ searchFormData, onSearch, appCode }) => {
  const { token } = theme.useToken();
  const config = searchFormData.searchFormConfig || {};
  const collapseRows = config.collapseRows || 1;
  // 只有明确配置 isCollapsible=true 才折叠，默认不折叠
  const isCollapsible = config.isCollapsible === true;
  const colsPerRow = config.cols || 4;
  const colSpan = Math.floor(24 / colsPerRow);

  const visibleFields = (searchFormData.searchFormFields || []).filter(
    sf => sf.isVisible !== false
  );

  // 批量请求 datasource 字段选项
  const [optionsMap, setOptionsMap] = React.useState<
    Record<string, { label: string; value: string }[]>
  >({});
  React.useEffect(() => {
    if (!appCode) return;
    const codes = [
      ...new Set(
        visibleFields
          .filter(
            sf =>
              DATASOURCE_FIELD_TYPES.includes(sf.fieldInfo?.fieldType as FieldType) &&
              sf.fieldInfo?.config?.datasourceCode
          )
          .map(sf => sf.fieldInfo!.config!.datasourceCode as string)
      ),
    ];
    if (!codes.length) return;
    datasourceApi
      .batchOptions({ appCode, datasourceCodes: codes })
      .then(res => {
        if (res?.data) setOptionsMap(res.data);
      })
      .catch(() => {});
  }, [appCode, searchFormData.searchFormCode]);

  const initialValues = React.useMemo(
    () => buildInitialValues(visibleFields),
    [searchFormData.searchFormCode]
  );

  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [searchFormData.searchFormCode]);

  const [collapsed, setCollapsed] = React.useState(isCollapsible);
  const maxVisible = collapsed ? collapseRows * colsPerRow : visibleFields.length;
  const displayFields = visibleFields.slice(0, maxVisible);

  const handleSearch = () => {
    form.validateFields().then(values => onSearch?.(values));
  };

  const handleReset = () => {
    form.resetFields();
    form.setFieldsValue(initialValues);
    onSearch?.(initialValues);
  };

  // 按钮推到行末：计算最后一行剩余空位
  const totalSlots = displayFields.length + 1;
  const usedInLastRow = totalSlots % colsPerRow || colsPerRow;
  const btnOffset = colsPerRow - usedInLastRow;

  return (
    <div
      style={{
        background: token.colorBgContainer,
        borderRadius: token.borderRadius,
        marginBottom: 8,
      }}
    >
      <Form form={form} layout="inline" initialValues={initialValues}>
        <Row gutter={[16, 0]} style={{ width: '100%' }}>
          {displayFields.map(sf => {
            const labelText = sf.displayName || sf.fieldName;
            return (
              <Col key={sf.fieldName} span={colSpan}>
                <Form.Item
                  name={sf.fieldName}
                  label={
                    <Tooltip title={labelText}>
                      <span
                        style={{
                          maxWidth: 72,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'inline-block',
                        }}
                      >
                        {labelText}
                      </span>
                    </Tooltip>
                  }
                  style={{ marginBottom: 12, width: '100%' }}
                  labelCol={{ style: { width: 72, flexShrink: 0 } }}
                  wrapperCol={{ style: { flex: 1, minWidth: 0 } }}
                >
                  {renderSearchControl(sf, optionsMap)}
                </Form.Item>
              </Col>
            );
          })}

          <Col
            span={colSpan}
            offset={btnOffset * colSpan}
            style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 12 }}
          >
            <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
              {isCollapsible && visibleFields.length > collapseRows * colsPerRow && (
                <Button
                  type="text"
                  icon={collapsed ? <DownOutlined /> : <UpOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                >
                  {collapsed ? '展开' : '收起'}
                </Button>
              )}
              <Button onClick={handleReset}>重置</Button>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default MetaSearchForm;
