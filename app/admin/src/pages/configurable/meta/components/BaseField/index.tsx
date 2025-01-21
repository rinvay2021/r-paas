import React from 'react';
import { useRequest } from 'ahooks';
import { debounce, get } from 'lodash';
import { useParams } from 'react-router-dom';
import { StringParam, useQueryParam } from 'use-query-params';
import { Button, Input, Flex, Table, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { metaService } from '@/api/meta';
import { UpdateFieldDto } from '@/api/meta/interface';
import { NUMBER_CONSTANTS } from '@/constant';
import { useElementHeight } from '@/hooks';
import FiledModal from './field-form';
import { useColumns } from './columns';
import { BaseFieldListItem, BooleanEnum } from './type';

import './index.less';

const BaseField: React.FC = () => {
  const { appCode } = useParams<{ appCode: string }>();
  const [metaObjectCode] = useQueryParam('metaObjectCode', StringParam);

  const idRef = React.useRef<string>('');
  const [keyword, setKeyword] = React.useState<string>('');
  const [fieldModalVisible, setFieldModalVisible] = React.useState(false);

  const paginationRef = React.useRef({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const {
    data,
    loading,
    run: queryFields,
  } = useRequest(metaService.queryFields, {
    manual: true,
    onSuccess: ({ data }) => {
      paginationRef.current.total = data.total;
    },
  });

  const fetchFields = React.useCallback(
    debounce(
      (params: { keyword?: string }) => {
        if (!appCode || !metaObjectCode) {
          message.info('应用和元数据对象参数缺失');
          return;
        }

        queryFields({
          appCode,
          metaObjectCode,
          keyword: params?.keyword,
          page: paginationRef.current.current,
          pageSize: paginationRef.current.pageSize,
        });
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
    fetchFields({ keyword });
  };

  const handleEnable = async (record: BaseFieldListItem) => {
    const params = {
      _id: record._id,
      isEnabled: record.isEnabled === BooleanEnum.YES ? BooleanEnum.NO : BooleanEnum.YES,
    } as UpdateFieldDto;

    const result = await metaService.updateField(params);
    message.success(result?.message);

    fetchFields({ keyword });
  };

  const handleEdit = (record: BaseFieldListItem) => {
    idRef.current = record._id;
    setFieldModalVisible(true);
  };

  const handleVisibleChange = (visible: boolean) => {
    if (!visible) {
      idRef.current = '';
    }
    setFieldModalVisible(visible);
  };

  // 监听 metaObjectCode 变化
  React.useEffect(() => {
    // 清空搜索框
    setKeyword('');

    // 重置页码到第一页
    paginationRef.current.current = 1;
    fetchFields({ keyword: '' });
  }, [metaObjectCode]);

  const columns = useColumns({ handleEdit, handleEnable });

  const height = useElementHeight({ elementId: 'baseField', offset: 126 });

  return (
    <Flex vertical gap="middle" className="field-container">
      <Flex justify="space-between" align="center" className="field-header">
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
              fetchFields({ keyword: '' });
            }
          }}
          onPressEnter={() => {
            paginationRef.current.current = 1;
            fetchFields({ keyword });
          }}
        />
        <Button type="dashed" icon={<PlusOutlined />} onClick={() => setFieldModalVisible(true)}>
          新建字段
        </Button>
      </Flex>
      <Table
        rowKey="_id"
        size="small"
        id="baseField"
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
      {/* 字段创建/编辑弹窗 */}
      {fieldModalVisible && (
        <FiledModal
          id={idRef.current}
          appCode={appCode}
          metaObjectCode={metaObjectCode}
          visible={fieldModalVisible}
          onVisibleChange={handleVisibleChange}
          onFinish={() => fetchFields({ keyword })}
        />
      )}
    </Flex>
  );
};

export default BaseField;
