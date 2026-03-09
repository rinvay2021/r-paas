import React from 'react';
import { useRequest } from 'ahooks';
import { debounce, get } from 'lodash';
import { Button, Input, Flex, Table, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { metaService } from '@/api/meta';
import { useElementHeight } from '@/hooks';
import { NUMBER_CONSTANTS } from '@/constant';
import { useMeta } from '@/store/metaAtom';
import type { UpdateActionButtonDto, QueryActionButtonDto } from '@/api/meta/interface';
import { META_FIELD_LIST_HEIGHT } from '../../constant';
import ButtonModal from './ButtonModal';
import { useColumns } from './columns';
import { FunctionButtonListItem } from './type';

import './index.less';

const FunctionButton: React.FC = () => {
  const { appCode, metaObjectCode } = useMeta();

  const height = useElementHeight({
    elementId: 'meta-page-container',
    offset: META_FIELD_LIST_HEIGHT,
  });

  const idRef = React.useRef<string>('');
  const [keyword, setKeyword] = React.useState<string>('');
  const [buttonModalVisible, setButtonModalVisible] = React.useState(false);

  const paginationRef = React.useRef({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const {
    data,
    loading,
    run: queryButtons,
  } = useRequest(metaService.queryActionButtons, {
    manual: true,
    onSuccess: ({ data }) => {
      paginationRef.current.total = data.total;
    },
  });

  const fetchButtons = React.useCallback(
    debounce(
      (params: { keyword?: string }) => {
        if (!appCode || !metaObjectCode) {
          message.info('应用和元数据对象参数缺失');
          return;
        }

        const queryParams: QueryActionButtonDto = {
          appCode,
          metaObjectCode,
          keyword: params?.keyword,
          page: paginationRef.current.current,
          pageSize: paginationRef.current.pageSize,
        };

        queryButtons(queryParams);
      },
      300,
      { leading: true }
    ),
    [appCode, metaObjectCode, keyword]
  );

  const handleTableChange = newPagination => {
    paginationRef.current = {
      ...paginationRef.current,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    };
    fetchButtons({ keyword });
  };

  const handleDelete = async (record: FunctionButtonListItem) => {
    if (!record._id) return;

    try {
      const result = await metaService.deleteActionButton?.(record._id);
      message.success(result?.message || '删除成功');
      fetchButtons({ keyword });
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleEdit = (record: FunctionButtonListItem) => {
    idRef.current = record._id || '';
    setButtonModalVisible(true);
  };

  const handleVisibleChange = (visible: boolean) => {
    if (!visible) {
      idRef.current = '';
    }
    setButtonModalVisible(visible);
  };

  // 监听 metaObjectCode 变化
  React.useEffect(() => {
    // 清空搜索框
    setKeyword('');

    // 重置页码到第一页
    paginationRef.current.current = 1;
    fetchButtons({ keyword: '' });
  }, [metaObjectCode]);

  const columns = useColumns({ handleEdit, handleDelete });

  return (
    <Flex vertical gap="middle">
      <Flex justify="space-between" align="center">
        <Input
          style={{ width: NUMBER_CONSTANTS.MAX_INPUT_LENGTH }}
          placeholder="输入名称或编码后回车搜索"
          prefix={<SearchOutlined />}
          allowClear
          value={keyword}
          onChange={e => {
            const value = e.target.value;
            setKeyword(value);
            // 如果输入框为空，则重置页码到第一页
            if (!value) {
              paginationRef.current.current = 1;
              fetchButtons({ keyword: '' });
            }
          }}
          onPressEnter={() => {
            paginationRef.current.current = 1;
            fetchButtons({ keyword });
          }}
        />
        <Button type="dashed" icon={<PlusOutlined />} onClick={() => setButtonModalVisible(true)}>
          新建功能按钮
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
      {/* 功能按钮创建/编辑弹窗 */}
      {buttonModalVisible && (
        <ButtonModal
          id={idRef.current}
          appCode={appCode}
          metaObjectCode={metaObjectCode}
          visible={buttonModalVisible}
          onVisibleChange={handleVisibleChange}
          onFinish={() => fetchButtons({ keyword })}
        />
      )}
    </Flex>
  );
};

export default FunctionButton;
