import React from 'react';
import { Button, Popconfirm } from 'antd';
import { filter } from 'lodash';
import classNames from 'classnames';
import { useDrop, useDrag } from 'react-dnd';
import { DeleteOutlined, PlusOutlined, MenuOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { FieldDto } from '@/api/meta/interface';
import { FieldSelector } from '../FieldSelector';
import { ContainerProps, FieldProps } from '../../types';

// 定义拖拽类型
const ItemTypes = {
  FIELD: 'field',
  CONTAINER: 'container',
};

const Field: React.FC<FieldProps> = props => {
  const { index, field, containerId, isSelectedField, onSelectField, onDeleteField, onMoveField } =
    props;
  const fieldRef = React.useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.FIELD,
    item: { type: ItemTypes.FIELD, id: field._id, containerId, index, field },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.FIELD,
    hover: (item: FieldProps, monitor) => {
      if (!fieldRef.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      const sourceContainerId = item.containerId;
      const targetContainerId = containerId;

      // 如果拖放到相同位置，不做任何操作
      if (dragIndex === hoverIndex && sourceContainerId === targetContainerId) {
        return;
      }

      // 获取鼠标位置
      const hoverBoundingRect = fieldRef.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // 向上拖动时，只在鼠标超过中点时移动
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // 向下拖动时，只在鼠标超过中点时移动
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMoveField(dragIndex, hoverIndex, sourceContainerId, targetContainerId, item.field);
      item.index = hoverIndex;
      item.containerId = targetContainerId;
    },
  });

  drag(drop(fieldRef));

  return (
    <div
      ref={fieldRef}
      className={classNames('field', {
        selected: isSelectedField,
        dragging: isDragging,
      })}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={e => {
        e.stopPropagation();
        onSelectField();
      }}
    >
      <MenuOutlined className="field-drag" />
      <div className="field-content">{field.fieldName}</div>
      <Button
        type="link"
        size="small"
        icon={<CloseCircleOutlined />}
        onClick={e => {
          e.stopPropagation();
          onDeleteField();
        }}
      />
    </div>
  );
};

export const Container: React.FC<ContainerProps> = props => {
  const {
    index,
    container,
    containers,
    selectedField,
    isSelectedContainer,
    onSelectField,
    onUpdateField,
    onMoveContainer,
    onSelectContainer,
    onRemoveContainer,
  } = props;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const existingFields = new Set(
    containers
      .map(c => c.fields)
      .flat()
      .map(f => f._id)
  );

  // 容器拖拽
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CONTAINER,
    item: { type: ItemTypes.CONTAINER, id: container.id, index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 修改字段移动处理逻辑
  const handleMoveField = (
    dragIndex: number,
    hoverIndex: number,
    sourceContainerId: string,
    targetContainerId: string,
    draggedField: FieldDto
  ) => {
    if (sourceContainerId === targetContainerId && sourceContainerId === container.id) {
      // 同容器内移动
      const newFields = [...container.fields];
      const [movedField] = newFields.splice(dragIndex, 1);
      newFields.splice(hoverIndex, 0, movedField);
      onUpdateField(container.id, newFields);
    } else if (targetContainerId === container.id) {
      // 跨容器移动到当前容器
      const sourceContainer = containers.find(c => c.id === sourceContainerId);
      if (!sourceContainer) return;

      // 更新源容器
      const sourceFields = sourceContainer.fields.filter((_, index) => index !== dragIndex);
      onUpdateField(sourceContainerId, sourceFields);

      // 更新目标容器
      const targetFields = [...container.fields];
      targetFields.splice(hoverIndex, 0, draggedField);
      onUpdateField(targetContainerId, targetFields);
    }
  };

  // 修改容器的 drop 处理
  const [, drop] = useDrop({
    accept: [ItemTypes.CONTAINER, ItemTypes.FIELD],
    hover: (item: any, monitor) => {
      if (!containerRef.current) return;

      if (item.type === ItemTypes.CONTAINER) {
        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) return;

        onMoveContainer(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
    drop: (item: any) => {
      if (item.type === ItemTypes.FIELD && container.fields.length === 0) {
        // 如果是空容器，允许直接放置字段
        handleMoveField(item.index, 0, item.containerId, container.id, item.field);
        return { containerId: container.id };
      }
    },
  });

  drag(drop(containerRef));

  return (
    <div
      ref={containerRef}
      className={classNames('container', { selected: isSelectedContainer })}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={e => {
        e.stopPropagation();
        onSelectContainer(container.id);
      }}
    >
      <div className="container-header">
        <div className="container-title">{container.title || '未命名区块'}</div>
        <div className="container-actions">
          <FieldSelector
            existingFields={existingFields}
            onConfirm={fields => {
              const newFields = [...(container.fields || []), ...fields];
              onUpdateField(container.id, newFields);
            }}
          >
            <Button type="link" icon={<PlusOutlined />} onClick={e => e.stopPropagation()} />
          </FieldSelector>
          {containers.length > 1 && (
            <Popconfirm
              title="确定要删除该区块吗？"
              onConfirm={() => onRemoveContainer(container.id)}
            >
              <Button type="link" icon={<DeleteOutlined />} onClick={e => e.stopPropagation()} />
            </Popconfirm>
          )}
        </div>
      </div>
      <div className="container-content">
        <div className={`fields columns-${container.columns}`}>
          {!container.fields?.length ? (
            <div className="fields-empty">请点击右上角 + 添加字段</div>
          ) : (
            container.fields.map((field, index) => {
              const isSelectedField = selectedField?.fieldId === field._id;
              const handleSelectField = () =>
                onSelectField({
                  containerId: container.id,
                  fieldId: field._id,
                });
              const handleDeleteField = () => {
                onUpdateField(
                  container.id,
                  filter(container.fields, f => f._id !== field._id)
                );
              };
              return (
                <Field
                  index={index}
                  key={field._id}
                  field={field}
                  containerId={container.id}
                  isSelectedField={isSelectedField}
                  onMoveField={handleMoveField}
                  onSelectField={handleSelectField}
                  onDeleteField={handleDeleteField}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
