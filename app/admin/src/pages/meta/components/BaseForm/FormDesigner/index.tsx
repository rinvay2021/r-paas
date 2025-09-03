import React from 'react';
import classNames from 'classnames';
import { useRequest } from 'ahooks';
import { v4 as uuidv4 } from 'uuid';
import { Button, message } from 'antd';
import { filter, map, isEmpty } from 'lodash';
import { PlusOutlined } from '@ant-design/icons';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { metaService } from '@/api/meta';
import { FieldDto, ContainerType, FormConfig } from '@/api/meta/interface';
import type { FormDesignerProps, FormDesignerRef } from './types';
import { Container } from './components/Container';
import { ConfigPanel } from './components/ConfigPanel';

import './index.less';

const FormDesigner: React.ForwardRefRenderFunction<FormDesignerRef, FormDesignerProps> = (
  props,
  ref
) => {
  const { refresh, height, activeForm } = props;

  // 状态管理
  const [selectedForm, setSelectedForm] = React.useState<boolean>(true);
  const [selectedContainer, setSelectedContainer] = React.useState<ContainerType | null>(null);
  const [selectedField, setSelectedField] = React.useState<{
    field: FieldDto;
    container: ContainerType;
  } | null>(null);

  const [formConfig, setFormConfig] = React.useState<FormConfig>();
  const [containers, setContainers] = React.useState<ContainerType[]>();

  React.useEffect(() => {
    // 如果表单没有区块，则创建一个默认区块
    const containers = isEmpty(activeForm?.containers)
      ? [
          {
            id: `container-${uuidv4()}`,
            title: '未命名区块',
            fields: [],
            columns: formConfig?.layoutSettings?.columns,
          },
        ]
      : activeForm?.containers;

    setFormConfig(activeForm?.formConfig);
    setContainers(containers);
  }, [activeForm]);

  // 保存表单配置
  const { run: saveForm } = useRequest(
    () => {
      if (!activeForm?.appCode || !activeForm?.metaObjectCode) {
        throw new Error('缺少必要参数');
      }

      const formData = {
        formConfig,
        containers,
        _id: activeForm?._id,
      };

      return metaService.updateForm(formData);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('保存成功');
        refresh();
      },
    }
  );

  // 处理函数
  const handleAddContainer = () => {
    const newContainer: ContainerType = {
      id: `container-${uuidv4()}`,
      title: '未命名区块',
      fields: [],
      columns: formConfig?.layoutSettings?.columns,
    };
    setContainers(prev => [...prev, newContainer]);
  };

  const handleRemoveContainer = (containerId: string) => {
    setContainers(prev => filter(prev, c => c.id !== containerId));
    if (selectedContainer?.id === containerId) {
      setSelectedContainer(null);
    }
  };

  const handleUpdateField = (containerId: string, fields: FieldDto[]) => {
    setContainers(prev =>
      map(prev, container => (container.id === containerId ? { ...container, fields } : container))
    );
  };

  const handleSelectContainer = (container: ContainerType) => {
    setSelectedContainer(container);
    setSelectedField(null);
    setSelectedForm(false);
  };

  const handleSelectField = (params: { container: ContainerType; field: FieldDto }) => {
    setSelectedField(params);
    setSelectedContainer(null);
    setSelectedForm(false);
  };

  // 处理容器排序
  const handleMoveContainer = (dragIndex: number, hoverIndex: number) => {
    setContainers(prev => {
      const newContainers = [...prev];
      const [removed] = newContainers.splice(dragIndex, 1);
      newContainers.splice(hoverIndex, 0, removed);
      return newContainers;
    });
  };

  const handleFormConfigChange = (values: Partial<FormConfig>) => {
    setFormConfig(prev => ({ ...prev, ...values }));
  };

  const handleContainerChange = (containerId: string, values: Partial<ContainerType>) => {
    setContainers(prev =>
      map(prev, container =>
        container.id === containerId ? { ...container, ...values } : container
      )
    );
  };

  const handleFieldChange = (containerId: string, fieldId: string, values: Partial<FieldDto>) => {
    setContainers(prev =>
      map(prev, container =>
        container.id === containerId
          ? {
              ...container,
              fields: map(container.fields, field =>
                field._id === fieldId ? { ...field, ...values } : field
              ),
            }
          : container
      )
    );
  };

  React.useImperativeHandle(ref, () => {
    return {
      saveForm,
    };
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div id="form-designer" className="form-designer" style={{ height }}>
        <div className="form-designer-left">
          <div
            onClick={() => {
              setSelectedContainer(null);
              setSelectedField(null);
              setSelectedForm(true);
            }}
            className={classNames('containers-wrapper', {
              selected: selectedForm,
            })}
          >
            <div className="containers">
              {map(containers, (container, index) => (
                <Container
                  index={index}
                  key={container.id}
                  container={container}
                  containers={containers}
                  selectedField={selectedField}
                  isSelectedContainer={selectedContainer?.id === container.id}
                  onSelectField={handleSelectField}
                  onUpdateField={handleUpdateField}
                  onMoveContainer={handleMoveContainer}
                  onSelectContainer={handleSelectContainer}
                  onRemoveContainer={handleRemoveContainer}
                />
              ))}
            </div>
            <Button
              block
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddContainer}
              style={{ marginTop: 16 }}
            >
              添加区块
            </Button>
          </div>
        </div>
        <div className="form-designer-right">
          <ConfigPanel
            formConfig={formConfig}
            containers={containers}
            selectedForm={selectedForm}
            selectedContainer={selectedContainer}
            selectedField={selectedField}
            onFormConfigChange={handleFormConfigChange}
            onContainerChange={handleContainerChange}
            onFieldChange={handleFieldChange}
          />
        </div>
      </div>
    </DndProvider>
  );
};

export default React.forwardRef(FormDesigner);
