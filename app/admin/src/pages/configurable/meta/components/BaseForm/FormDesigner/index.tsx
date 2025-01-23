import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import Sortable from 'sortablejs';
import { Container } from './components/Container';
import { ConfigPanel } from './components/ConfigPanel';
import { useElementHeight } from '@/hooks/useElementHeight';
import type { Container as ContainerType, FormConfig } from './types';
import './index.less';

// 模拟字段树数据
const treeData = [
  {
    title: '基础字段',
    key: 'basic',
    children: [
      {
        title: '单行文本',
        key: 'text_name',
        appCode: 'demo',
        metaObjectCode: 'user',
        fieldCode: 'name',
        type: 'text',
      },
      {
        title: '多行文本',
        key: 'textarea_desc',
        appCode: 'demo',
        metaObjectCode: 'user',
        fieldCode: 'description',
        type: 'textarea',
      },
      {
        title: '数字输入',
        key: 'number_age',
        appCode: 'demo',
        metaObjectCode: 'user',
        fieldCode: 'age',
        type: 'number',
      },
    ],
  },
  {
    title: '高级字段',
    key: 'advanced',
    children: [
      {
        title: '日期选择',
        key: 'date_birth',
        appCode: 'demo',
        metaObjectCode: 'user',
        fieldCode: 'birthDate',
        type: 'date',
      },
      {
        title: '下拉选择',
        key: 'select_status',
        appCode: 'demo',
        metaObjectCode: 'user',
        fieldCode: 'status',
        type: 'select',
      },
    ],
  },
];

const FormDesigner: React.FC = () => {
  const [containers, setContainers] = useState<ContainerType[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<{
    containerId: string;
    fieldId: string;
  } | null>(null);
  const [isMainContainerSelected, setIsMainContainerSelected] = useState(true);
  const [formConfig, setFormConfig] = useState<FormConfig>({
    columns: 1,
    name: '',
  });

  const containersRef = useRef<HTMLDivElement>(null);

  // 使用 useElementHeight 获取内容区域高度
  const contentHeight = useElementHeight({
    elementId: 'form-designer',
    offset: 16, // 如果有其他固定元素，需要调整这个值
  });

  useEffect(() => {
    if (containersRef.current) {
      const sortable = Sortable.create(containersRef.current, {
        animation: 150,
        handle: '.container-header',
        draggable: '.container',
        group: 'containers',
        ghostClass: 'sortable-ghost',
        onEnd: evt => {
          const { oldIndex, newIndex } = evt;
          if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
            setContainers(prevContainers => {
              const newContainers = [...prevContainers];
              const [removed] = newContainers.splice(oldIndex, 1);
              newContainers.splice(newIndex, 0, removed);
              return newContainers;
            });
          }
        },
      });

      return () => {
        sortable.destroy();
      };
    }
  }, []);

  const handleAddContainer = () => {
    const newContainer: ContainerType = {
      id: `container_${Date.now()}`,
      title: '新区块',
      fields: [],
      columns: formConfig.columns,
    };
    setContainers([...containers, newContainer]);
  };

  return (
    <div id="form-designer" className="form-designer" style={{ height: contentHeight }}>
      <div className="form-designer-left">
        <div
          onClick={() => {
            setSelectedContainer(null);
            setSelectedField(null);
            setIsMainContainerSelected(true);
          }}
          className={classNames('containers-wrapper', {
            selected: isMainContainerSelected,
          })}
        >
          <div ref={containersRef} className="containers">
            {containers.map(container => (
              <Container
                key={container.id}
                container={container}
                onRemove={id => {
                  setContainers(containers.filter(c => c.id !== id));
                  if (selectedContainer === id) {
                    setSelectedContainer(null);
                  }
                }}
                onAddField={(containerId, fields) => {
                  setContainers(prevContainers => {
                    const newContainers = [...prevContainers];
                    const targetContainer = newContainers.find(c => c.id === containerId);
                    if (targetContainer) {
                      targetContainer.fields = fields;
                    }
                    return newContainers;
                  });
                }}
                onSelect={() => {
                  setSelectedContainer(container.id);
                  setIsMainContainerSelected(false);
                  setSelectedField(null);
                }}
                onFieldSelect={fieldId => {
                  setSelectedField({ containerId: container.id, fieldId });
                  setSelectedContainer(null);
                  setIsMainContainerSelected(false);
                }}
                isSelected={selectedContainer === container.id}
                selectedFieldId={
                  selectedField?.containerId === container.id ? selectedField.fieldId : undefined
                }
              />
            ))}
          </div>
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={handleAddContainer}
            style={{ marginTop: 16 }}
          >
            添加区块
          </Button>
        </div>
      </div>
      <div className="form-designer-right">
        <div className="form-designer-content">
          <ConfigPanel
            selectedField={selectedField}
            selectedContainer={selectedContainer}
            isMainContainerSelected={isMainContainerSelected}
            containers={containers}
            formConfig={formConfig}
            onFormConfigChange={values => setFormConfig({ ...formConfig, ...values })}
            onContainerChange={(containerId, values) => {
              setContainers(prevContainers => {
                const newContainers = [...prevContainers];
                const targetContainer = newContainers.find(c => c.id === containerId);
                if (targetContainer) {
                  Object.assign(targetContainer, values);
                }
                return newContainers;
              });
            }}
            onFieldChange={(containerId, fieldId, values) => {
              setContainers(prevContainers => {
                const newContainers = [...prevContainers];
                const targetContainer = newContainers.find(c => c.id === containerId);
                if (targetContainer) {
                  const targetField = targetContainer.fields.find(f => f.id === fieldId);
                  if (targetField) {
                    Object.assign(targetField, values);
                  }
                }
                return newContainers;
              });
            }}
          />
        </div>
        <div className="form-designer-footer">
          <Button type="primary" block style={{ marginBottom: 8 }}>
            保存
          </Button>
          <Button block>取消</Button>
        </div>
      </div>
    </div>
  );
};

export default FormDesigner;
