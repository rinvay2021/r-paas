import React from 'react';
import type { DetailPageDesignerRef, DetailPageDesignerProps } from './types';

const DetailPageDesigner: React.ForwardRefRenderFunction<
  DetailPageDesignerRef,
  DetailPageDesignerProps
> = (props, ref) => {
  const { refresh, height, activeDetail } = props;

  React.useImperativeHandle(ref, () => ({
    saveDetail: () => {
      // console.log('saveDetail');
    },
  }));

  return <div>DetailPageDesigner</div>;
};

export default React.forwardRef(DetailPageDesigner);
