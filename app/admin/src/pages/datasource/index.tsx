import React from 'react';
import { useRequest } from 'ahooks';
import { debounce, get } from 'lodash';
import { Button, Input, Flex, Table, message, Modal } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { datasourceService } from '@/api/datasource';
import { useElementHeight } from '@/hooks';
import { NUMBER_CONSTANTS } from '@/constant';
import DatasourceModal from './DatasourceModal';
import { useColumns } from './columns';
import type { DatasourceListItem } from './type';

import './index.less';

const DATASOURCE_LIST_HEIGHT = 230;

const DatasourcePage: React.FC = () => {
  const { appCode } = useParams<{ appCode: string }>();

  const height = useElementHeight({
    elementId: 'meta-page-container',
    offset: DATASOURCE_LIST_HEIGHT,
  });

  const idRef = React.useRef<string>('');
  const [keyword, setKeyword] = React.useState<string>('');
  const [modalVisible, setModalVisible] = React.useState(false);

  const paginationRef = React.useRef({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const {
    data,
    loading,
    run: queryDatasources,
  } = useRequest(datasourceService.queryDatasources, {
    manual: true,
    onSuccess: ({ data }) => {
      paginationRef.current.total = data.total;
    },
  });

  const fetchDatasources = React.useCallback(
    debounce(
      (params: { keyword?: string }) => {
        if (!appCode) {
          message.info('应用参数缺失');
          return;
        }

        queryDatasources({
          appCode,
          keyword: params?.keyword,
          page: paginationRef.current.current,
          pageSize: paginationRef.current.pageSize,
        });
      },
      300,
      { leading: true }
    ),
    [appCode, keyword]
  );

  const handleTableChange = newPagination => {
    paginationRef.current = {
      ...paginationRef.current,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    };
    fetchDatasources({ keyword });
  };

  const handleDelete = async (record: DatasourceListItem) => {
    Modal.confirm({
      title: '确定要删除吗？',
      content: '删除后数据将无法恢复',
      onOk: async () => {
        try {
          await datasourceService.deleteDatasource(record._id);
          message.success('删除成功');
          fetchDatasources({ keyword });
        } catch (error) {
          message.error(error?.message || '删除失败');
        }
      },
    });
  };

  const handleEdit = (record: DatasourceListItem) => {
    idRef.current = record._id;
    setModalVisible(true);
  };

  const handleVisibleChange = (visible: boolean) => {
    if (!visible) {
      idRef.current = '';
    }
    setModalVisible(visible);
  };

  // 监听 appCode 变化
  React.useEffect(() => {
    // 清空搜索框
    setKeyword('');

    // 重置页码到第一页
    paginationRef.current.current = 1;
    fetchDatasources({ keyword: '' });
  }, [appCode]);

  const columns = useColumns({ handleEdit, handleDelete });

  return (
    <Flex vertical gap="middle" className="datasource-page">
      <Flex justify="space-between" align="center">
        <Input
          style={{ width: NUMBER_CONSTANTS.MAX_INPUT_LENGTH }}
          placeholder="输入数据源名称后回车搜索"
          prefix={<SearchOutlined />}
          allowClear
          value={keyword}
          onChange={e => {
            const value = e.target.value;
            setKeyword(value);
            // 如果输入框为空，则重置页码到第一页
            if (!value) {
              paginationRef.current.current = 1;
              fetchDatasources({ keyword: '' });
            }
          }}
          onPressEnter={() => {
            paginationRef.current.current = 1;
            fetchDatasources({ keyword });
          }}
        />
        <Button type='primary' icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          新建数据源
        </Button>
      </Flex>
      <Table
        rowKey="_id"
        size="small"
        loading={loading}
        columns={columns}
        dataSource={get(data, 'data.list', [])}
        pagination={{
          ...paginationRef.current,
          showQuickJumper: true,
          showSizeChanger: true,
          pageSizeOptions: [20, 50, 100],
          showTotal: total => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 'max-content', y: height }}
      />
      {/* 数据源创建/编辑弹窗 */}
      {modalVisible && (
        <DatasourceModal
          id={idRef.current}
          appCode={appCode}
          visible={modalVisible}
          onVisibleChange={handleVisibleChange}
          onFinish={() => fetchDatasources({ keyword })}
        />
      )}
    </Flex>
  );
};

export default DatasourcePage;
