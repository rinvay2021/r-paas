import React from 'react';
import classNames from 'classnames';
import { useRequest } from 'ahooks';
import { v4 as uuidv4 } from 'uuid';
import { filter, map } from 'lodash';
import { Button, message } from 'antd';
import { DndProvider } from 'react-dnd';
import { PlusOutlined } from '@ant-design/icons';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { metaService } from '@/api/meta';
import { useElementHeight } from '@/hooks/useElementHeight';
import { Container } from './components/Container';
import { ConfigPanel } from './components/ConfigPanel';
import type { ContainerType, FieldDto, FormBaseConfig, FormDesignerProps } from './types';

import './index.less';

const FormDesigner: React.FC<FormDesignerProps> = props => {
  const { formCode, appCode, metaObjectCode } = props;
  const contentHeight = useElementHeight({ elementId: 'form-designer', offset: 16 });

  // 状态管理
  const [containers, setContainers] = React.useState<ContainerType[]>(() => [
    {
      id: `container-${uuidv4()}`,
      title: '未命名区块',
      fields: [],
      columns: 1,
    },
  ]);
  const [selectedForm, setSelectedForm] = React.useState<boolean>(false);
  const [selectedContainer, setSelectedContainer] = React.useState<string | null>(null);
  const [selectedField, setSelectedField] = React.useState<{
    containerId: string;
    fieldId: string;
  } | null>(null);

  const [formConfig, setFormConfig] = React.useState<FormBaseConfig>({
    columns: 1,
    title: '',
  });

  // 保存表单配置
  const { loading: saveLoading, run: saveForm } = useRequest(
    async () => {
      if (!appCode || !metaObjectCode) {
        throw new Error('缺少必要参数');
      }

      const formData = {
        appCode,
        metaObjectCode,
        formCode,
        config: {
          ...formConfig,
          containers,
        },
      };

      return metaService.saveFormConfig(formData);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('保存成功');
      },
      onError: error => {
        message.error(`保存失败: ${error.message}`);
      },
    }
  );

  // 处理函数
  const handleAddContainer = () => {
    const newContainer: ContainerType = {
      id: `container-${uuidv4()}`,
      title: '未命名区块',
      fields: [],
      columns: formConfig.columns,
    };
    setContainers(prev => [...prev, newContainer]);
  };

  const handleRemoveContainer = (containerId: string) => {
    setContainers(prev => filter(prev, c => c.id !== containerId));
    if (selectedContainer === containerId) {
      setSelectedContainer(null);
    }
  };

  const handleUpdateField = (containerId: string, fields: FieldDto[]) => {
    setContainers(prev =>
      map(prev, container => (container.id === containerId ? { ...container, fields } : container))
    );
  };

  const handleSelectContainer = (containerId: string) => {
    setSelectedContainer(containerId);
    setSelectedField(null);
    setSelectedForm(false);
  };

  const handleSelectField = (params: { containerId: string; fieldId: string }) => {
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div id="form-designer" className="form-designer" style={{ height: contentHeight }}>
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
              {containers.map((container, index) => (
                <Container
                  index={index}
                  key={container.id}
                  container={container}
                  containers={containers}
                  selectedField={selectedField}
                  isSelectedContainer={selectedContainer === container.id}
                  onSelectField={handleSelectField}
                  onUpdateField={handleUpdateField}
                  onMoveContainer={handleMoveContainer}
                  onSelectContainer={handleSelectContainer}
                  onRemoveContainer={handleRemoveContainer}
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
              containers={containers}
              formConfig={formConfig}
              onFormConfigChange={values => setFormConfig(prev => ({ ...prev, ...values }))}
              onContainerChange={(containerId, values) => {
                setContainers(prev =>
                  prev.map(container =>
                    container.id === containerId ? { ...container, ...values } : container
                  )
                );
              }}
              onFieldChange={(containerId, fieldId, values) => {
                setContainers(prev =>
                  prev.map(container =>
                    container.id === containerId
                      ? {
                          ...container,
                          fields: container.fields.map(field =>
                            field._id === fieldId ? { ...field, ...values } : field
                          ),
                        }
                      : container
                  )
                );
              }}
            />
          </div>
          <div className="form-designer-footer">
            <Button
              type="primary"
              block
              style={{ marginBottom: 8 }}
              loading={saveLoading}
              onClick={saveForm}
            >
              保存
            </Button>
            <Button block>取消</Button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default FormDesigner;
