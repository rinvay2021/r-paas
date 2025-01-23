import React, { useEffect, useRef } from 'react';
import { Button } from 'antd';
import { DeleteOutlined, PlusOutlined, MenuOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import Sortable from 'sortablejs';
import type { Container as ContainerType, Field } from '../../types';

interface ContainerProps {
  container: ContainerType;
  onRemove: (id: string) => void;
  onAddField: (containerId: string, fields: Field[]) => void;
  onSelect: () => void;
  onFieldSelect: (fieldId: string) => void;
  isSelected?: boolean;
  selectedFieldId?: string;
}

export const Container: React.FC<ContainerProps> = ({
  container,
  onRemove,
  onAddField,
  onSelect,
  onFieldSelect,
  isSelected,
  selectedFieldId,
}) => {
  const fieldsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fieldsRef.current) return;

    const sortable = new Sortable(fieldsRef.current, {
      group: {
        name: 'fields',
        pull: 'clone',
        put: true,
      },
      animation: 150,
      handle: '.field-drag',
      draggable: '.field',
      ghostClass: 'sortable-ghost',
      onAdd: evt => {
        try {
          const { item, to, from } = evt;

          // 如果是从树形控件拖入
          const fieldData = JSON.parse(item.getAttribute('data-field') || '{}');
          if (fieldData.key) {
            const newField: Field = {
              id: `field_${Date.now()}`,
              appCode: fieldData.appCode || '',
              metaObjectCode: fieldData.metaObjectCode || '',
              fieldCode: fieldData.fieldCode || '',
              name: fieldData.title || '新字段',
              type: fieldData.type || 'text',
            };
            const newFields = [...container.fields, newField];
            onAddField(container.id, newFields);
          } else {
            // 如果是从其他区块拖入
            const fieldId = item.getAttribute('data-field-id');
            const sourceField = container.fields.find(f => f.id === fieldId);
            if (sourceField) {
              const newField = { ...sourceField, id: `field_${Date.now()}` };
              const newFields = [...container.fields, newField];
              onAddField(container.id, newFields);
            }
          }

          // 移除克隆的元素
          if (item.parentNode) {
            item.parentNode.removeChild(item);
          }
        } catch (error) {
          console.error('Error adding field:', error);
        }
      },
      onEnd: evt => {
        try {
          const { from, to } = evt;
          if (!from || !to) return;

          const fromContainerId = from.dataset.containerId;
          const toContainerId = to.dataset.containerId;

          if (fromContainerId === toContainerId) {
            const newFields = Array.from(to.children)
              .filter(el => el.classList.contains('field'))
              .map(el => {
                const fieldId = el.getAttribute('data-field-id');
                const field = container.fields.find(f => f.id === fieldId);
                if (!field) {
                  throw new Error(`Field not found: ${fieldId}`);
                }
                return field;
              })
              .filter(Boolean);

            onAddField(container.id, newFields);
          }
        } catch (error) {
          console.error('Error reordering fields:', error);
        }
      },
      setData: (dataTransfer, dragEl) => {
        dataTransfer.setData('text', '');
      },
    });

    return () => {
      sortable.destroy();
    };
  }, [container.id, container.fields, onAddField]);

  return (
    <div
      className={classNames('container', { selected: isSelected })}
      onClick={e => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="container-header">
        <div className="container-title">{container.title || '未命名区块'}</div>
        <div className="container-actions">
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={e => {
              e.stopPropagation();
              onAddField(container.id, [
                ...container.fields,
                {
                  id: `field_${Date.now()}`,
                  name: '新字段',
                  type: 'input',
                  appCode: '',
                  metaObjectCode: '',
                  fieldCode: '',
                },
              ]);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={e => {
              e.stopPropagation();
              onRemove(container.id);
            }}
          />
        </div>
      </div>
      <div className="container-content">
        <div
          ref={fieldsRef}
          className={`fields columns-${container.columns}`}
          data-container-id={container.id}
        >
          {!container.fields || container.fields.length === 0 ? (
            <div className="fields-empty">请点击右上角 + 添加字段</div>
          ) : (
            container.fields.map(field => (
              <div
                key={field.id}
                className={classNames('field', { selected: selectedFieldId === field.id })}
                data-field-id={field.id}
                onClick={e => {
                  e.stopPropagation();
                  onFieldSelect(field.id);
                }}
              >
                <MenuOutlined className="field-drag" />
                <div className="field-content">{field.name}</div>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={e => {
                    e.stopPropagation();
                    onAddField(
                      container.id,
                      container.fields.filter(f => f.id !== field.id)
                    );
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
