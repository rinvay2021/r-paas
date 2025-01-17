import React from 'react';
import { debounce } from 'lodash';
import { useRequest } from 'ahooks';
import { useParams } from 'react-router-dom';
import { ModalForm } from '@ant-design/pro-components';
import { StringParam, useQueryParam } from 'use-query-params';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Flex, Table, FormInstance, message } from 'antd';
import { metaService } from '@/api/meta';
import { NUMBER_CONSTANTS } from '@/constant';
import BaseFieldForm from './field-form';
import { useColumns } from './columns';

import './index.less';

const BaseField: React.FC = () => {
  const { appCode } = useParams<{ appCode: string }>();
  const [metaObjectCode] = useQueryParam('metaObjectCode', StringParam);
  const fieldFormRef = React.useRef<FormInstance>();
  const [keyword, setKeyword] = React.useState<string>('');
  const [createModalVisible, setCreateModalVisible] = React.useState(false);
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const columns = useColumns();

  const {
    data,
    run: queryFields,
    loading,
  } = useRequest(metaService.queryFields, {
    manual: true,
    onSuccess: ({ data }) => {
      setPagination(prev => ({
        ...prev,
        total: data.total,
      }));
    },
  });

  const handleSearch = React.useCallback(
    debounce((searchKeyword: string) => {
      if (!appCode || !metaObjectCode) return;

      queryFields({
        keyword: searchKeyword,
        appCode,
        metaObjectCode,
        pageSize: pagination.pageSize,
        page: pagination.current,
      });
    }, 300),
    [appCode, metaObjectCode, pagination.pageSize, pagination.current]
  );

  // 处理表格分页变化
  const handleTableChange = newPagination => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
    handleSearch(keyword);
  };

  // 监听 metaObjectCode 变化
  React.useEffect(() => {
    setKeyword('');
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    handleSearch('');
  }, [metaObjectCode]);

  return (
    <Flex vertical gap="middle" className="field-container">
      <Flex justify="space-between" align="center" className="field-header">
        <Input
          style={{ width: NUMBER_CONSTANTS.MAX_INPUT_LENGTH }}
          placeholder="请输入字段名称或编码搜索"
          prefix={<SearchOutlined />}
          allowClear
          value={keyword}
          onChange={e => {
            const newKeyword = e.target.value;
            setKeyword(newKeyword);
            setPagination(prev => ({ ...prev, current: 1 }));
            handleSearch(newKeyword);
          }}
        />
        <Button type="dashed" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          新建字段
        </Button>
      </Flex>

      <Table
        rowKey="_id"
        size="small"
        loading={loading}
        columns={columns}
        dataSource={data?.data?.list}
        pagination={{
          ...pagination,
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: total => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 'max-content', y: 'calc(100vh - 280px)' }}
        sticky
        className="field-table"
      />

      <ModalForm
        title="新建字段"
        formRef={fieldFormRef}
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        modalProps={{
          destroyOnClose: true,
        }}
        onFinish={async values => {
          const result = await metaService.createField({
            ...values,
            appCode,
            metaObjectCode,
          });
          message.success(result?.message);
          handleSearch();
          return true;
        }}
      >
        <BaseFieldForm formInstance={fieldFormRef} />
      </ModalForm>
    </Flex>
  );
};

export default BaseField;
