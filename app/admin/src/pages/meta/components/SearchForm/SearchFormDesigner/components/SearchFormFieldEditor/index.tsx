import React from 'react';
import { map } from 'lodash';
import type { FormListFieldData } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { DeleteOutlined, HolderOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Select, Table } from 'antd';
import { SearchFormFieldDto, FieldDto } from '@/api/meta/interface';
import { FieldSelector } from '@/pages/meta/biz-components/FieldSelector';

import { DRAG_TYPE, CONDITION_OPTIONS } from '../../constant';
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

  // 初始化表单值
  React.useEffect(() => {
    form.setFieldsValue({ searchFormFields: value });
  }, [value, form]);

  React.useImperativeHandle(ref, () => ({
    getSearchFormFields: () => form.getFieldValue('searchFormFields') || [],
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

    const newFields = map(selectedFields, field => ({
      fieldName: field.fieldName || '',
      displayName: field.fieldName || '',
      condition: '=',
      defaultValue: '',
      placeholder: `请输入${field.fieldName || ''}`,
      isVisible: true,
    }));

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
                render: (_, field) => (
                  <Form.Item name={[field.name, 'fieldName']} noStyle>
                    <Input disabled placeholder="字段名称" />
                  </Form.Item>
                ),
              },
              {
                title: '显示名称',
                dataIndex: 'fieldType',
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
                width: 120,
                render: (_, field) => (
                  <Form.Item name={[field.name, 'condition']} noStyle>
                    <Select style={{ width: '100%' }} options={CONDITION_OPTIONS} />
                  </Form.Item>
                ),
              },
              {
                title: '默认值',
                dataIndex: 'defaultValue',
                width: 150,
                render: (_, field) => (
                  <Form.Item name={[field.name, 'defaultValue']} noStyle>
                    <Input placeholder="默认值" />
                  </Form.Item>
                ),
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
                scroll={{ x: 800 }}
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
      <FieldSelector existingFields={existingFields} onConfirm={handleAddFields}>
        <Button type="link" icon={<PlusOutlined />}>
          添加字段
        </Button>
      </FieldSelector>
    </Form>
  );
};

export default React.forwardRef(SearchFormFieldEditor);
