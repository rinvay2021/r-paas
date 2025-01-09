import React, { useState } from 'react';
import { Flex, Select, Switch, Button, Table, Segmented } from 'antd';
import { META_CONFIG_TYPE } from '@/constant';
import './index.less';

const Dashboard: React.FC = () => {
  // 模拟数据
  const [dataSource] = useState([
    { id: 1, name: '配置1', status: true },
    { id: 2, name: '配置2', status: false },
  ]);

  // 表格列定义
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => <Switch checked={status} />,
    },
  ];

  return (
    <Flex className="rpaas-dashboard" vertical gap="middle">
      {/* 顶部操作区 */}
      <Flex justify="space-between" align="center">
        <Select style={{ width: 200 }} placeholder="请选择对象" options={META_CONFIG_TYPE} />
        <Segmented options={META_CONFIG_TYPE} />

        <Button type="primary">新建对象</Button>
      </Flex>

      {/* 底部表格 */}
      <Table dataSource={dataSource} columns={columns} rowKey="id" />
    </Flex>
  );
};

export default Dashboard;
