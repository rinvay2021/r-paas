import React from 'react';
import { useElementHeight } from '@/hooks';

const BaseForm: React.FC = () => {
  const height = useElementHeight({ elementId: 'baseForm', offset: 32 });

  return (
    <div id="baseForm" style={{ height: `${height}px`, overflow: 'auto' }}>
      BaseForm
    </div>
  );
};

export default BaseForm;
