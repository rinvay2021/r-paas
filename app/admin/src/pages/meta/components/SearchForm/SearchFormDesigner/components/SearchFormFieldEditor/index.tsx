import React from 'react';
import { map } from 'lodash';
import dayjs from 'dayjs';
import type { FormListFieldData } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { DeleteOutlined, HolderOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Select, Table } from 'antd';
import { SearchFormFieldDto, FieldDto } from '@/api/meta/interface';
import { FieldSelector } from '@/pages/meta/biz-components/FieldSelector';
import { FieldTypeEnum } from '@/pages/meta/components/BaseField/type';
import { useMetaFields } from '@/store/metaFields';
import {
  isFieldSearchable,
  getSqlConditionsByFieldType,
  SqlConditionOperator,
  isRangeCondition,
} from '../../utils/searchConditions';
import DefaultValueInput from '../DefaultValueInput';

import { DRAG_TYPE } from '../../constant';
import { DraggableRowProps, DragItem, SearchFormFieldEditorRef } from '../../types';

const DraggableRow: React.FC<DraggableRowProps> = ({ index, moveRow, ...restProps }) => {
  const ref = React.useRef<HTMLTableRowElement>(null);
  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: DRAG_TYPE,
    collect: monitor => ({
      handlerId: monitor.getHandlerId(),
    }),
    hover: (item: DragItem) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: () => ({ index }),
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;

  drag(drop(ref));

  return (
    <tr ref={ref} style={{ cursor: 'move', opacity }} data-handler-id={handlerId} {...restProps} />
  );
};

const SearchFormFieldEditor: React.ForwardRefRenderFunction<
  SearchFormFieldEditorRef,
  {
    value?: SearchFormFieldDto[];
  }
> = ({ value = [] }, ref) => {
  const [form] = Form.useForm();
  const [fieldTypeMap, setFieldTypeMap] = React.useState<Map<string, FieldTypeEnum>>(new Map());
  const allMetaFields = useMetaFields();

  // 初始化表单值和字段类型映射
  React.useEffect(() => {
    // 根据已有字段建立字段类型映射
    const newFieldTypeMap = new Map<string, FieldTypeEnum>();
    value.forEach(field => {
      if (field.fieldName) {
        const metaField = allMetaFields.find(f => f.fieldCode === field.fieldName);
        if (metaField && metaField.fieldType) {
          newFieldTypeMap.set(field.fieldName, metaField.fieldType as FieldTypeEnum);
        }
      }
    });
    setFieldTypeMap(newFieldTypeMap);

    // 转换字符串日期为 dayjs 对象
    const processedFields = value.map(field => {
      const fieldName = field.fieldName;
      const fieldType = newFieldTypeMap.get(fieldName);
      const condition = field.condition as SqlConditionOperator;
      let defaultValue = field.defaultValue;

      // 处理日期时间类型的默认值
      if (
        fieldType &&
        (fieldType === FieldTypeEnum.DatePicker ||
          fieldType === FieldTypeEnum.MonthPicker ||
          fieldType === FieldTypeEnum.YearPicker ||
          fieldType === FieldTypeEnum.TimePicker) &&
        defaultValue
      ) {
        // 范围条件：数组
        if (isRangeCondition(condition) && Array.isArray(defaultValue)) {
          defaultValue = defaultValue.map(dateStr => {
            if (typeof dateStr === 'string' && dateStr) {
              return dayjs(dateStr);
            }
            return dateStr;
          });
        }
        // 单个日期
        else if (typeof defaultValue === 'string' && defaultValue) {
          defaultValue = dayjs(defaultValue);
        }
      }

      return {
        ...field,
        defaultValue,
      };
    });

    form.setFieldsValue({ searchFormFields: processedFields });
  }, [value, form, allMetaFields]);

  React.useImperativeHandle(ref, () => ({
    getSearchFormFields: () => {
      const fields = form.getFieldValue('searchFormFields') || [];

      // 转换日期对象为字符串
      return fields.map((field: SearchFormFieldDto) => {
        const fieldName = field.fieldName;
        const fieldType = fieldTypeMap.get(fieldName);
        const condition = field.condition as SqlConditionOperator;
        let defaultValue = field.defaultValue;

        // 处理日期时间类型的默认值
        if (
          fieldType &&
          (fieldType === FieldTypeEnum.DatePicker ||
            fieldType === FieldTypeEnum.MonthPicker ||
            fieldType === FieldTypeEnum.YearPicker ||
            fieldType === FieldTypeEnum.TimePicker)
        ) {
          // 范围条件：数组
          if (isRangeCondition(condition) && Array.isArray(defaultValue)) {
            defaultValue = defaultValue.map(date => {
              if (dayjs.isDayjs(date)) {
                // 根据字段类型选择不同的格式
                if (fieldType === FieldTypeEnum.DatePicker) {
                  return date.format('YYYY-MM-DD');
                } else if (fieldType === FieldTypeEnum.MonthPicker) {
                  return date.format('YYYY-MM');
                } else if (fieldType === FieldTypeEnum.YearPicker) {
                  return date.format('YYYY');
                } else if (fieldType === FieldTypeEnum.TimePicker) {
                  return date.format('HH:mm:ss');
                }
              }
              return date;
            });
          }
          // 单个日期
          else if (dayjs.isDayjs(defaultValue)) {
            if (fieldType === FieldTypeEnum.DatePicker) {
              defaultValue = defaultValue.format('YYYY-MM-DD');
            } else if (fieldType === FieldTypeEnum.MonthPicker) {
              defaultValue = defaultValue.format('YYYY-MM');
            } else if (fieldType === FieldTypeEnum.YearPicker) {
              defaultValue = defaultValue.format('YYYY');
            } else if (fieldType === FieldTypeEnum.TimePicker) {
              defaultValue = defaultValue.format('HH:mm:ss');
            }
          }
        }

        return {
          ...field,
          defaultValue,
        };
      });
    },
  }));

  const moveRow = React.useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const fields = form.getFieldValue('searchFormFields') || [];
      const newFields = [...fields];
      const [dragRow] = newFields.splice(dragIndex, 1);
      newFields.splice(hoverIndex, 0, dragRow);
      form.setFieldsValue({ searchFormFields: newFields });
    },
    [form]
  );

  const handleAddFields = (selectedFields: FieldDto[]) => {
    const currentFields = form.getFieldValue('searchFormFields') || [];

    // 过滤掉不可搜索的字段
    const searchableFields = selectedFields.filter(field => {
      const fieldType = field.fieldType as FieldTypeEnum;
      return fieldType && isFieldSearchable(fieldType);
    });

    // 更新字段类型映射
    const newFieldTypeMap = new Map(fieldTypeMap);
    searchableFields.forEach(field => {
      if (field.fieldCode && field.fieldType) {
        newFieldTypeMap.set(field.fieldCode, field.fieldType as FieldTypeEnum);
      }
    });
    setFieldTypeMap(newFieldTypeMap);

    const newFields = map(searchableFields, field => {
      const fieldType = field.fieldType as FieldTypeEnum;
      const conditions = getSqlConditionsByFieldType(fieldType);
      const defaultCondition = conditions[0]?.value || SqlConditionOperator.EQUAL;

      return {
        fieldName: field.fieldCode || '',
        displayName: field.fieldName || '',
        condition: defaultCondition,
        defaultValueType: 'system', // 默认为系统输入
        defaultValue: '',
        placeholder: `请输入${field.fieldName || ''}`,
        isVisible: true,
      };
    });

    const updatedFields = [...currentFields, ...newFields];
    form.setFieldsValue({ searchFormFields: updatedFields });
  };

  // 获取已经选择的字段名
  const existingFields = React.useMemo(() => {
    const fields = form.getFieldValue('searchFormFields') || value;
    return new Set(fields.map((f: SearchFormFieldDto) => f.fieldName).filter(Boolean) as string[]);
  }, [form, value]);

  return (
    <Form form={form} component={false}>
      <DndProvider backend={HTML5Backend}>
        <Form.List name="searchFormFields">
          {(fields, { remove }) => {
            const columns: ColumnsType<FormListFieldData & { key: React.Key }> = [
              {
                title: '排序',
                width: 80,
                render: (_, __, index) => (
                  <>
                    <HolderOutlined style={{ cursor: 'grab', marginRight: 8 }} />
                    {index + 1}
                  </>
                ),
              },
              {
                title: '字段名称',
                dataIndex: 'fieldName',
                width: 150,
                render: (_, field) => {
                  const fieldName = form.getFieldValue(['searchFormFields', field.name, 'fieldName']);
                  return (
                    <Form.Item name={[field.name, 'fieldName']} noStyle>
                      <span style={{ padding: '4px 11px', display: 'inline-block' }}>{fieldName}</span>
                    </Form.Item>
                  );
                },
              },
              {
                title: '显示名称',
                dataIndex: 'displayName',
                width: 150,
                render: (_, field) => (
                  <Form.Item name={[field.name, 'displayName']} noStyle>
                    <Input placeholder="显示名称" />
                  </Form.Item>
                ),
              },
              {
                title: '可选查询条件',
                dataIndex: 'condition',
                width: 150,
                render: (_, field) => {
                  const fieldName = form.getFieldValue(['searchFormFields', field.name, 'fieldName']);
                  const fieldType = fieldTypeMap.get(fieldName);

                  if (!fieldType) {
                    return (
                      <Form.Item name={[field.name, 'condition']} noStyle>
                        <Select style={{ width: '100%' }} disabled placeholder="未知字段类型" />
                      </Form.Item>
                    );
                  }

                  const conditions = getSqlConditionsByFieldType(fieldType);

                  return (
                    <Form.Item name={[field.name, 'condition']} noStyle>
                      <Select
                        style={{ width: '100%' }}
                        options={conditions}
                        onChange={() => {
                          // 切换条件时清空默认值
                          form.setFieldValue(['searchFormFields', field.name, 'defaultValue'], '');
                        }}
                      />
                    </Form.Item>
                  );
                },
              },
              {
                title: '默认值选择',
                dataIndex: 'defaultValueType',
                width: 120,
                render: (_, field) => (
                  <Form.Item name={[field.name, 'defaultValueType']} noStyle>
                    <Select
                      style={{ width: '100%' }}
                      options={[
                        { label: '自定义', value: 'custom' },
                        { label: '系统输入', value: 'system' },
                      ]}
                      onChange={(value) => {
                        // 切换为系统输入时清空默认值
                        if (value === 'system') {
                          form.setFieldValue(['searchFormFields', field.name, 'defaultValue'], '');
                        }
                      }}
                    />
                  </Form.Item>
                ),
              },
              {
                title: '默认值',
                dataIndex: 'defaultValue',
                width: 200,
                render: (_, field) => {
                  return (
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) => {
                        const prevCondition = prevValues.searchFormFields?.[field.name]?.condition;
                        const currentCondition = currentValues.searchFormFields?.[field.name]?.condition;
                        const prevValueType = prevValues.searchFormFields?.[field.name]?.defaultValueType;
                        const currentValueType = currentValues.searchFormFields?.[field.name]?.defaultValueType;
                        return prevCondition !== currentCondition || prevValueType !== currentValueType;
                      }}
                    >
                      {() => {
                        const fieldName = form.getFieldValue(['searchFormFields', field.name, 'fieldName']);
                        const fieldType = fieldTypeMap.get(fieldName);
                        const condition = form.getFieldValue([
                          'searchFormFields',
                          field.name,
                          'condition',
                        ]) as SqlConditionOperator;
                        const defaultValueType = form.getFieldValue([
                          'searchFormFields',
                          field.name,
                          'defaultValueType',
                        ]);

                        // 系统输入时禁用默认值输入
                        const isDisabled = defaultValueType === 'system';

                        if (!fieldType || !condition) {
                          return (
                            <Form.Item name={[field.name, 'defaultValue']} noStyle>
                              <Input placeholder="默认值" disabled />
                            </Form.Item>
                          );
                        }

                        return (
                          <Form.Item name={[field.name, 'defaultValue']} noStyle>
                            <DefaultValueInput
                              fieldType={fieldType}
                              condition={condition}
                              disabled={isDisabled}
                              placeholder={isDisabled ? '系统输入' : '默认值'}
                            />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>
                  );
                },
              },
              {
                title: '提示语',
                dataIndex: 'placeholder',
                width: 150,
                render: (_, field) => (
                  <Form.Item name={[field.name, 'placeholder']} noStyle>
                    <Input placeholder="提示语" />
                  </Form.Item>
                ),
              },
              {
                title: '是否显示',
                dataIndex: 'isVisible',
                width: 100,
                render: (_, field) => (
                  <Form.Item name={[field.name, 'isVisible']} valuePropName="checked" noStyle>
                    <Checkbox />
                  </Form.Item>
                ),
              },
              {
                title: '操作',
                width: 80,
                fixed: 'right',
                render: (_, field) => (
                  <Button
                    type="link"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      remove(field.name);
                    }}
                  />
                ),
              },
            ];

            return (
              <Table
                size="small"
                columns={columns}
                dataSource={fields}
                rowKey="key"
                pagination={false}
                scroll={{ x: 1200 }}
                components={{
                  body: {
                    row: (props: any) => {
                      const index = fields.findIndex(item => item.key === props['data-row-key']);
                      return <DraggableRow index={index} moveRow={moveRow} {...props} />;
                    },
                  },
                }}
              />
            );
          }}
        </Form.List>
      </DndProvider>
      <FieldSelector
        existingFields={existingFields}
        onConfirm={handleAddFields}
        filterFieldType={(fieldType: string) => {
          return isFieldSearchable(fieldType as FieldTypeEnum);
        }}
      >
        <Button type="link" icon={<PlusOutlined />}>
          添加字段
        </Button>
      </FieldSelector>
    </Form>
  );
};

export default React.forwardRef(SearchFormFieldEditor);
