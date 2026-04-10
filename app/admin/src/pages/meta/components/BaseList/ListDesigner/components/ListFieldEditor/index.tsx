import React from 'react';
import { map } from 'lodash';
import type { FormListFieldData } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { DeleteOutlined, HolderOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, InputNumber, Select, Table } from 'antd';
import { ListFieldDto, FieldDto } from '@/api/meta/interface';
import { FieldSelector } from '@/pages/meta/biz-components/FieldSelector';
import ListFieldSettingsButton from '../ListFieldSettingsButton';

import { DRAG_TYPE, ALIGN_OPTIONS } from '../../constant';
import { DraggableRowProps, DragItem, ListFieldEditorRef } from '../../types';

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

const ListFieldEditor: React.ForwardRefRenderFunction<
  ListFieldEditorRef,
  {
    value?: ListFieldDto[];
  }
> = ({ value = [] }, ref) => {
  const [form] = Form.useForm();

  // 初始化表单值
  React.useEffect(() => {
    form.setFieldsValue({ listFields: value });
  }, [value, form]);

  React.useImperativeHandle(ref, () => ({
    getListFields: () => form.getFieldValue('listFields') || [],
  }));

  const moveRow = React.useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const fields = form.getFieldValue('listFields') || [];
      const newFields = [...fields];
      const [dragRow] = newFields.splice(dragIndex, 1);
      newFields.splice(hoverIndex, 0, dragRow);
      // 更新 sort 字段
      const updatedFields = newFields.map((field: ListFieldDto, idx: number) => ({
        ...field,
        sort: idx + 1,
      }));
      form.setFieldsValue({ listFields: updatedFields });
    },
    [form]
  );

  const handleAddFields = (selectedFields: FieldDto[]) => {
    const currentFields = form.getFieldValue('listFields') || [];

    const newFields = map(selectedFields, (field, idx) => ({
      id: field._id || '',
      sort: currentFields?.length + idx + 1,
      name: field.fieldName || '',
      displayName: field.fieldName || '',
      isVisible: true,
      showHelp: false,
      helpTip: '',
      width: 120,
      align: 'left',
      field: field,
      fieldConfig: {},
    }));

    const updatedFields = [...currentFields, ...newFields];
    form.setFieldsValue({ listFields: updatedFields });
  };

  // 获取已经选择的字段 ID
  const existingFields = React.useMemo(() => {
    const fields = form.getFieldValue('listFields') || value;
    return new Set(fields.map((f: ListFieldDto) => f.field?._id).filter(Boolean) as string[]);
  }, [form, value]);

  return (
    <Form form={form} component={false}>
      <DndProvider backend={HTML5Backend}>
        <Form.List name="listFields">
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
                dataIndex: 'name',
                width: 150,
                render: (_, field) => (
                  <Form.Item name={[field.name, 'name']} noStyle>
                    <Input disabled placeholder="显示名称" />
                  </Form.Item>
                ),
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
                title: '显示帮助',
                dataIndex: 'showHelp',
                width: 100,
                render: (_, field) => (
                  <Form.Item name={[field.name, 'showHelp']} valuePropName="checked" noStyle>
                    <Checkbox />
                  </Form.Item>
                ),
              },
              {
                title: '帮助文本',
                dataIndex: 'helpText',
                width: 150,
                render: (_, field) => (
                  <Form.Item name={[field.name, 'helpText']} noStyle>
                    <Input placeholder="帮助文本" />
                  </Form.Item>
                ),
              },
              {
                title: '宽度',
                dataIndex: 'width',
                width: 120,
                render: (_, field) => (
                  <Form.Item name={[field.name, 'width']} noStyle>
                    <InputNumber min={60} max={500} style={{ width: '100%' }} />
                  </Form.Item>
                ),
              },
              {
                title: '对齐方式',
                dataIndex: 'align',
                width: 120,
                render: (_, field) => (
                  <Form.Item name={[field.name, 'align']} noStyle>
                    <Select style={{ width: '100%' }} options={ALIGN_OPTIONS} />
                  </Form.Item>
                ),
              },
              {
                title: '唯一键',
                dataIndex: 'isUniqueKey',
                width: 80,
                render: (_, field) => (
                  <Form.Item name={[field.name, 'isUniqueKey']} valuePropName="checked" noStyle>
                    <Checkbox />
                  </Form.Item>
                ),
              },
              {
                title: '操作',
                width: 100,
                fixed: 'right',
                render: (_, field) => (
                  <>
                    <Form.Item name={[field.name, 'fieldConfig']} noStyle>
                      <ListFieldSettingsButton />
                    </Form.Item>
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => remove(field.name)}
                    />
                  </>
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
                scroll={{ x: 1000 }}
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
        <Button type="text" icon={<PlusOutlined />}>
          添加字段
        </Button>
      </FieldSelector>
    </Form>
  );
};

export default React.forwardRef(ListFieldEditor);
