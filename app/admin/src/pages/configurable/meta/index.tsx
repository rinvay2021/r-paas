import React from 'react';
import { map } from 'lodash';
import { useRequest } from 'ahooks';
import { useParams } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { useQueryParam, StringParam } from 'use-query-params';
import { Flex, Select, Button, message, Segmented, Divider } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';

import { metaService } from '@/api/meta';
import type { MetaObjectDto } from '@/api/meta/interface';
import { META_CONFIG_TYPE, META_CONFIG, NUMBER_CONSTANTS, prefix } from '@/constant';
import {
  BaseField,
  BaseForm,
  BaseDetail,
  BaseList,
  SearchForm,
  FunctionButton,
  BaseView,
} from './components';
import './index.less';

export const MetaContext = React.createContext<{
  appCode: string;
  metaObjectCode: string;
  configurableType: string;
}>({
  appCode: '',
  metaObjectCode: '',
  configurableType: '',
});

const Dashboard: React.FC = () => {
  const { appCode } = useParams<{ appCode: string }>();
  // 获取查询参数
  const [metaObjectCode, setMetaObjectCode] = useQueryParam('metaObjectCode', StringParam);
  const [configurableType, setConfigurableType] = useQueryParam('configurableType', StringParam);

  // 新增创建对象的模态框状态
  const [createModalOpen, setCreateModalOpen] = React.useState<boolean>(false);
  const [metaObjectList, setMetaObjectList] = React.useState<MetaObjectDto[]>([]);

  const { refresh: refreshObjects } = useRequest(() => metaService.queryMetaObjects({ appCode }), {
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
  });

  const renderConfigComponent = () => {
    switch (configurableType) {
      // 基础字段
      case META_CONFIG.BaseField:
        return <BaseField />;
      // 基础表单
      case META_CONFIG.BaseForm:
        return <BaseForm />;
      // 基础详情
      case META_CONFIG.BaseDetail:
        return <BaseDetail />;
      // 基础列表
      case META_CONFIG.BaseList:
        return <BaseList />;
      // 基础搜索表单
      case META_CONFIG.SearchForm:
        return <SearchForm />;
      // 基础功能按钮
      case META_CONFIG.FunctionButton:
        return <FunctionButton />;
      // 基础视图
      case META_CONFIG.BaseView:
        return <BaseView />;
      default:
        return null;
    }
  };

  return (
    <MetaContext.Provider
      value={{
        metaObjectCode,
        appCode,
        configurableType,
      }}
    >
      <Flex className={`${prefix}-configurable-meta`} vertical gap="middle">
        {/* 顶部操作区 */}
        <Flex justify="space-between" align="center">
          {/* 选择对象 */}
          <Select
            placeholder="请选择对象"
            options={metaObjectList}
            value={metaObjectCode}
            onChange={value => setMetaObjectCode(value)}
            style={{ width: NUMBER_CONSTANTS.MAX_INPUT_LENGTH }}
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
        <Divider dashed style={{ margin: 0 }} />

        {/* 配置组件模块 */}
        {renderConfigComponent()}

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
    </MetaContext.Provider>
  );
};

export default Dashboard;
