import React from 'react';
import { find } from 'lodash';
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
    const container = find(containers, c => c.id === selectedField.container.id);
    const field = find(container?.fields, f => f._id === selectedField.field._id);

    const handleFieldChange = values => {
      onFieldChange(selectedField.container.id, selectedField.field._id, values);
    };

    if (field) {
      return <FieldConfigPanel key={field._id} field={field} onChange={handleFieldChange} />;
    }
  }

  if (selectedContainer) {
    const container = find(containers, c => c.id === selectedContainer.id);

    const handleContainerChange = values => {
      onContainerChange(selectedContainer.id, values);
    };

    if (container) {
      return (
        <BlockConfigPanel
          key={container.id}
          container={container}
          onChange={handleContainerChange}
        />
      );
    }
  }

  if (selectedForm) {
    return <FormConfigPanel config={formConfig} containers={containers} onChange={onFormConfigChange} />;
  }

  return null;
};
