import React from 'react';
import { FormConfigPanel } from './FormConfig';
import { BlockConfigPanel } from './BlockConfig';
import { FieldConfigPanel } from './FieldConfig';
import type { Container, Field, FormConfig } from '../../types';

export interface ConfigPanelProps {
  selectedField: { containerId: string; fieldId: string } | null;
  selectedContainer: string | null;
  isMainContainerSelected: boolean;
  containers: Container[];
  formConfig: FormConfig;
  onFormConfigChange: (values: Partial<FormConfig>) => void;
  onContainerChange: (containerId: string, values: Partial<Container>) => void;
  onFieldChange: (containerId: string, fieldId: string, values: Partial<Field>) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  selectedField,
  selectedContainer,
  isMainContainerSelected,
  containers,
  formConfig,
  onFormConfigChange,
  onContainerChange,
  onFieldChange,
}) => {
  if (selectedField) {
    const container = containers.find(c => c.id === selectedField.containerId);
    const field = container?.fields.find(f => f.id === selectedField.fieldId);
    if (field) {
      return (
        <FieldConfigPanel
          field={field}
          onChange={values =>
            onFieldChange(selectedField.containerId, selectedField.fieldId, values)
          }
        />
      );
    }
  }

  if (selectedContainer) {
    const container = containers.find(c => c.id === selectedContainer);
    if (container) {
      return (
        <BlockConfigPanel
          container={container}
          onChange={values => onContainerChange(selectedContainer, values)}
        />
      );
    }
  }

  if (isMainContainerSelected) {
    return <FormConfigPanel config={formConfig} onChange={onFormConfigChange} />;
  }

  return null;
};
