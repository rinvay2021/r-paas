import React from 'react';
import { useRequest } from 'ahooks';
import { message, Form, Button, Table, Input, Switch, Space, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import type { ColumnsType } from 'antd/es/table';
import {
  ProFormText,
  ProFormTextArea,
  ProFormSwitch,
  ModalForm,
} from '@ant-design/pro-components';
import { datasourceService } from '@/api/datasource';
import type { DatasourceModalProps, DatasourceOption } from '../type';
import { BooleanEnum } from '../type';

import './index.less';

const DatasourceModal: React.FC<DatasourceModalProps> = params => {
  const { id, appCode, visible, onVisibleChange, onFinish } = params;

  const formInstance = React.useRef<FormInstance>();

  // 是否是编辑
  const isEdit = Boolean(id);

  // 编辑时获取数据源信息
  useRequest(() => datasourceService.getDatasourceById(id), {
    manual: false,
    onSuccess: resp => {
      formInstance?.current?.setFieldsValue(resp?.data);
    },
    ready: isEdit,
  });

  return (
    <ModalForm
      open={visible}
      title={isEdit ? '编辑数据源' : '新建数据源'}
      formRef={formInstance}
      onOpenChange={onVisibleChange}
      width={800}
      initialValues={{
        isEnabled: BooleanEnum.YES,
        options: [{ optionName: '', optionCode: '', isEnabled: BooleanEnum.YES }],
      }}
      modalProps={{
        destroyOnClose: true,
      }}
      onFinish={async values => {
        let result;

        // 校验选项编码是否重复
        const optionCodes = values.options?.map(opt => opt.optionCode) || [];
        const uniqueCodes = new Set(optionCodes);
        if (optionCodes.length !== uniqueCodes.size) {
          message.error('选项编码不能重复');
          return false;
        }

        // 校验至少有一个选项
        if (!values.options || values.options.length === 0) {
          message.error('至少需要一个选项');
          return false;
        }

        if (isEdit) {
          result = await datasourceService.updateDatasource({
            ...values,
            _id: id,
          });
        } else {
          result = await datasourceService.createDatasource({
            ...values,
            appCode,
          });
        }

        message.success(result?.message);
        onFinish?.();
        return true;
      }}
    >
      <ProFormText
        name="datasourceName"
        label="数据源名称"
        placeholder="请输入数据源名称"
        rules={[{ required: true, message: '请输入数据源名称' }]}
      />

      <ProFormText
        name="datasourceCode"
        label="数据源编码"
        placeholder="请输入数据源编码"
        disabled={isEdit}
        rules={[
          { required: true, message: '请输入数据源编码' },
          {
            pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
            message: '编码必须以字母开头，只能包含字母、数字和下划线',
          },
        ]}
        tooltip={isEdit ? '数据源编码创建后不可修改' : undefined}
      />

      <ProFormTextArea
        name="datasourceDesc"
        label="描述"
        placeholder="请输入描述"
        fieldProps={{
          rows: 3,
        }}
      />

      <Form.Item
        name="isEnabled"
        label="是否启用"
        valuePropName="checked"
        getValueFromEvent={checked => (checked ? BooleanEnum.YES : BooleanEnum.NO)}
        getValueProps={value => ({ checked: value === BooleanEnum.YES })}
      >
        <Switch checkedChildren="启用" unCheckedChildren="禁用" />
      </Form.Item>

      <Form.Item
        label="数据源选项"
        required
        rules={[
          {
            validator: async (_, options) => {
              if (!options || options.length === 0) {
                return Promise.reject(new Error('至少需要一个选项'));
              }
            },
          },
        ]}
      >
        <Form.List name="options">
          {(fields, { add, remove }) => {
            const columns: ColumnsType<any> = [
              {
                title: '选项名称',
                dataIndex: 'optionName',
                width: '35%',
                render: (_, __, index) => (
                  <Form.Item
                    name={[index, 'optionName']}
                    rules={[{ required: true, message: '请输入选项名称' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="请输入选项名称" />
                  </Form.Item>
                ),
              },
              {
                title: '选项编码',
                dataIndex: 'optionCode',
                width: '35%',
                render: (_, __, index) => (
                  <Form.Item
                    name={[index, 'optionCode']}
                    rules={[
                      { required: true, message: '请输入选项编码' },
                      {
                        pattern: /^[a-zA-Z0-9_]+$/,
                        message: '编码只能包含字母、数字和下划线',
                      },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="请输入选项编码" />
                  </Form.Item>
                ),
              },
              {
                title: '是否启用',
                dataIndex: 'isEnabled',
                width: 100,
                align: 'center',
                render: (_, __, index) => (
                  <Form.Item
                    name={[index, 'isEnabled']}
                    valuePropName="checked"
                    getValueFromEvent={checked => (checked ? BooleanEnum.YES : BooleanEnum.NO)}
                    getValueProps={value => ({ checked: value === BooleanEnum.YES })}
                    style={{ marginBottom: 0 }}
                  >
                    <Switch size="small" />
                  </Form.Item>
                ),
              },
              {
                title: '操作',
                width: 80,
                render: (_, __, index) => (
                  <Popconfirm
                    title="确定删除此选项？"
                    onConfirm={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      disabled={fields.length === 1}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                ),
              },
            ];

            return (
              <>
                <Table
                  columns={columns}
                  dataSource={fields}
                  pagination={false}
                  size="small"
                  rowKey="key"
                  className="datasource-options-table"
                />
                <Button
                  type="dashed"
                  onClick={() =>
                    add({ optionName: '', optionCode: '', isEnabled: BooleanEnum.YES })
                  }
                  block
                  icon={<PlusOutlined />}
                  style={{ marginTop: 8 }}
                >
                  添加选项
                </Button>
              </>
            );
          }}
        </Form.List>
      </Form.Item>
    </ModalForm>
  );
};

export default DatasourceModal;
