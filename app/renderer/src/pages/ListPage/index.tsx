import React from 'react';
import { Skeleton, Result } from 'antd';
import { useRequest } from 'ahooks';
import { rendererApi } from '@/api/renderer';
import MetaList from '@/components/MetaList';

const ListPage: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const appCode = params.get('appCode') || '';
  const metaObjectCode = params.get('metaObjectCode') || '';
  const listCode = params.get('listCode') || '';

  const { data, loading, error } = useRequest(
    () => rendererApi.getList({ appCode, metaObjectCode, listCode }),
    { ready: !!(appCode && metaObjectCode && listCode) },
  );

  if (error) return <Result status="error" title="加载失败" subTitle={error.message} />;
  if (loading) return <Skeleton active paragraph={{ rows: 6 }} />;

  const listData = data?.data?.list;
  if (!listData) return null;

  return (
    <div style={{ padding: '8px 12px' }}>
      <MetaList listData={listData} />
    </div>
  );
};

export default ListPage;
