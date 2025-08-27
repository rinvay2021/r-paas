import React from 'react';

import ConfigPanel from './components/ConfigPanel';
import type { DetailPageDesignerRef, DetailPageDesignerProps } from './types';

import './index.less';
import { DetailPageConfig } from '@/api/meta/interface';

const DetailPageDesigner: React.ForwardRefRenderFunction<
  DetailPageDesignerRef,
  DetailPageDesignerProps
> = (props, ref) => {
  const { refresh, height, activeDetail } = props;

  const [detailPageConfig, setDetailPageConfig] = React.useState<DetailPageConfig>();

  React.useEffect(() => {
    setDetailPageConfig(activeDetail?.detailPageConfig);
  }, [activeDetail]);

  React.useImperativeHandle(ref, () => ({
    saveDetail: () => {
      // TODO: 保存详情页配置
    },
  }));

  return (
    <div id="form-designer" className="form-designer" style={{ height }}>
      <div className="form-designer-left">
        <div className="containers-wrapper selected"></div>
      </div>
      <div className="form-designer-right">
        <ConfigPanel config={detailPageConfig} onChange={setDetailPageConfig} />
      </div>
    </div>
  );
};

export default React.forwardRef(DetailPageDesigner);
