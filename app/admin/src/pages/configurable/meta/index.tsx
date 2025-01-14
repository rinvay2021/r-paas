import React from 'react';
import { map } from 'lodash';
import { useRequest } from 'ahooks';
import { useParams } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { useQueryParam, StringParam } from 'use-query-params';
import { Flex, Select, Switch, Button, Table, Segmented, message } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';

import { metaService } from '@/api/meta';
import { META_CONFIG_TYPE } from '@/constant';
import type { MetaObjectDto } from '@/api/meta/interface';

import './index.less';

const Dashboard: React.FC = () => {
  const { appCode } = useParams<{ appCode: string }>();

  const [configurableType, setConfigurableType] = useQueryParam('configurableType', StringParam);
  const [metaObjectCode, setMetaObjectCode] = useQueryParam('metaObjectCode', StringParam);

  // 新增创建对象的模态框状态
  const [createModalOpen, setCreateModalOpen] = React.useState<boolean>(false);
  const [metaObjectList, setMetaObjectList] = React.useState<MetaObjectDto[]>([]);

  const { loading: objectLoading, refresh: refreshObjects } = useRequest(
    () => metaService.queryMetaObjects({ appCode }),
    {
      onSuccess: res => {
        const list = map(res?.data?.list, (item: MetaObjectDto) => {
          return {
            label: item.metaObjectName,
            value: item.metaObjectCode,
          };
        });

        // 如果没有选中对象且列表不为空，默认选中第一个
        if (!metaObjectCode && list.length > 0) {
          setMetaObjectCode(list[0].value);
        }

        // 如果没有选中配置类型，默认选中第一个
        if (!configurableType) {
          setConfigurableType(META_CONFIG_TYPE[0].value);
        }

        setMetaObjectList(list);
      },
      refreshDeps: [appCode],
    }
  );

  // 表格列定义
  const columns = [
    { title: '对象名称', dataIndex: 'metaObjectName', key: 'metaObjectName' },
    { title: '对象编码', dataIndex: 'metaObjectCode', key: 'metaObjectCode' },
    { title: '描述', dataIndex: 'metaObjectDesc', key: 'metaObjectDesc' },
    {
      key: 'isEnabled',
      title: '状态',
      dataIndex: 'isEnabled',
      render: (isEnabled: boolean) => <Switch checked={isEnabled} />,
    },
  ];

  return (
    <Flex className="rpaas-dashboard" vertical gap="middle">
      {/* 顶部操作区 */}
      <Flex justify="space-between" align="center">
        {/* 选择对象 */}
        <Select
          style={{ width: 200 }}
          placeholder="请选择对象"
          options={metaObjectList}
          value={metaObjectCode}
          onChange={value => setMetaObjectCode(value)}
        />
        {/* 选择配置类型 */}
        <Segmented
          options={META_CONFIG_TYPE}
          value={configurableType}
          onChange={value => setConfigurableType(value)}
        />
        {/* 新建对象 */}
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          新建对象
        </Button>
      </Flex>

      {/* 底部表格 */}
      <Table dataSource={[]} columns={columns} rowKey="metaObjectCode" loading={objectLoading} />

      {/* 新增创建对象的表单 */}
      <ModalForm<MetaObjectDto>
        title="新建对象"
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        modalProps={{
          destroyOnClose: true,
        }}
        onFinish={async values => {
          const result = await metaService.createMetaObject({
            ...values,
            appCode,
          });

          message.success(result?.message);
          refreshObjects();

          return true;
        }}
      >
        <ProFormText
          name="metaObjectName"
          label="对象名称"
          placeholder="请输入对象名称"
          rules={[{ required: true, message: '请输入对象名称' }]}
        />
        <ProFormText
          name="metaObjectCode"
          label="对象编码"
          placeholder="请输入对象编码"
          rules={[
            { required: true, message: '请输入对象编码' },
            {
              pattern: /^[A-Z][a-zA-Z]*$/,
              message: '以大写字母开头，只能包含英文字母',
            },
          ]}
        />
        <ProFormTextArea name="metaObjectDesc" label="描述" placeholder="请输入描述信息" />
      </ModalForm>
    </Flex>
  );
};

export default Dashboard;
