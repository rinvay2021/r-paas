import React from 'react';
import { Skeleton, Result } from 'antd';
import { useRequest } from 'ahooks';
import { rendererApi } from '@/api/renderer';
import MetaSearchForm from '@/components/MetaSearchForm';

const SearchFormPage: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const appCode = params.get('appCode') || '';
  const metaObjectCode = params.get('metaObjectCode') || '';
  const searchFormCode = params.get('searchFormCode') || '';

  const { data, loading, error } = useRequest(
    () => rendererApi.getSearchForm({ appCode, metaObjectCode, searchFormCode }),
    { ready: !!(appCode && metaObjectCode && searchFormCode) },
  );

  if (error) return <Result status="error" title="加载失败" subTitle={error.message} />;
  if (loading) return <Skeleton active paragraph={{ rows: 3 }} />;

  const searchFormData = data?.data?.searchForm;
  if (!searchFormData) return null;

  return (
    <div style={{ padding: '8px 12px' }}>
      <MetaSearchForm
        searchFormData={searchFormData}
        onSearch={(values) => console.log('preview search:', values)}
      />
    </div>
  );
};

export default SearchFormPage;
