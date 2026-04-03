import React from 'react';
import { Skeleton, Result } from 'antd';
import { useRequest } from 'ahooks';
import { rendererApi } from '@/api/renderer';
import MetaView from '@/components/MetaView';

interface ViewPageProps {
  appCode?: string;
  metaObjectCode?: string;
  viewCode?: string;
}

const ViewPage: React.FC<ViewPageProps> = (props) => {
  const urlParams = new URLSearchParams(window.location.search);
  const appCode = props.appCode || urlParams.get('appCode') || '';
  const metaObjectCode = props.metaObjectCode || urlParams.get('metaObjectCode') || '';
  const viewCode = props.viewCode || urlParams.get('viewCode') || '';

  const { data, loading, error } = useRequest(
    () => rendererApi.getView({ appCode, metaObjectCode, viewCode }),
    { ready: !!(appCode && metaObjectCode && viewCode) },
  );

  if (error) return <Result status="error" title="加载失败" subTitle={error.message} />;
  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;

  const viewData = data?.data;
  if (!viewData) return null;

  return (
    <MetaView
      viewData={viewData}
      appCode={appCode}
      metaObjectCode={metaObjectCode}
    />
  );
};

export default ViewPage;
