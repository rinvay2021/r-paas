import React from 'react';
import { FormConfigPanel } from './FormConfig';
import { BlockConfigPanel } from './BlockConfig';
import { FieldConfigPanel } from './FieldConfig';
import type { ConfigPanelProps } from '../../types';

export const ConfigPanel: React.FC<ConfigPanelProps> = props => {
  const {
    formConfig,
    containers,
    selectedForm,
    selectedField,
    selectedContainer,
    onFieldChange,
    onContainerChange,
    onFormConfigChange,
  } = props;

  if (selectedField) {
    const container = containers.find(c => c.id === selectedField.containerId);
    const field = container?.fields.find(f => f._id === selectedField.fieldId);

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

  if (selectedForm) {
    return <FormConfigPanel config={formConfig} onChange={onFormConfigChange} />;
  }

  return null;
};
