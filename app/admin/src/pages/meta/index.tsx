import React from 'react';
import { map } from 'lodash';
import { PlusOutlined } from '@ant-design/icons';
import { Flex, Select, Button, message, Segmented, Divider } from 'antd';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';

import { metaService } from '@/api/meta';
import type { MetaObjectDto } from '@/api/meta/interface';
import { META_CONFIG_TYPE, META_CONFIG, NUMBER_CONSTANTS, prefix } from '@/constant';

import {
  useMeta,
  useInitMetaObjects,
  useMetaObjectListAtom,
  useRefreshMetaObjects,
} from '@/store/metaAtom';
import { useInitMetaFieldAtom } from '@/store/metaFields';
import { useInitMetaButtonAtom } from '@/store/metaButtons';
import { useInitMetaFormAtom } from '@/store/metaFormAtom';
import { useInitMetaDetailAtom } from '@/store/metaDetailAtom';
import { useInitMetaListAtom } from '@/store/metaListAtom';
import { useInitMetaSearchFormAtom } from '@/store/metaSearchFormAtom';
import { useInitMetaViewAtom } from '@/store/metaViewAtom';

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

const ComponentMap = {
  [META_CONFIG.BaseField]: BaseField,
  [META_CONFIG.BaseForm]: BaseForm,
  [META_CONFIG.BaseDetail]: BaseDetail,
  [META_CONFIG.BaseList]: BaseList,
  [META_CONFIG.SearchForm]: SearchForm,
  [META_CONFIG.FunctionButton]: FunctionButton,
  [META_CONFIG.BaseView]: BaseView,
};

const ConfigComponent: React.FC = () => {
  /** 初始化字段 */
  useInitMetaFieldAtom();
  /** 初始化按钮 */
  useInitMetaButtonAtom();
  /** 初始化表单数据源 */
  useInitMetaFormAtom();
  /** 初始化详情页数据源 */
  useInitMetaDetailAtom();
  /** 初始化列表数据源 */
  useInitMetaListAtom();
  /** 初始化搜索表单数据源 */
  useInitMetaSearchFormAtom();
  /** 初始化视图数据源 */
  useInitMetaViewAtom();
  /** 渲染组件 */
  const { configurableType } = useMeta();

  const Component = ComponentMap[configurableType as META_CONFIG];
  return Component ? <Component /> : null;
};

const Dashboard: React.FC = () => {
  const metaObjectList = useMetaObjectListAtom();
  const refreshObjects = useRefreshMetaObjects();

  const { appCode, metaObjectCode, configurableType } = useMeta();
  const { setMetaObjectCode, setConfigurableType } = useInitMetaObjects();
  const [createModalOpen, setCreateModalOpen] = React.useState<boolean>(false);

  const metaObjectOptions = React.useMemo(() => {
    return map(metaObjectList, item => ({
      value: item.metaObjectCode,
      label: item.metaObjectName,
    }));
  }, [metaObjectList]);

  return (
    <Flex className={`${prefix}-configurable-meta`} vertical>
      {/* 顶部操作区 */}
      <Flex justify="space-between" align="center">
        {/* 选择对象 */}
        <Select
          placeholder="请选择对象"
          options={metaObjectOptions}
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
        <Button type="default" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          新建对象
        </Button>
      </Flex>
      <Divider dashed style={{ margin: '8px 0' }} />

      {/* 页面锚点 */}
      <div id="meta-page-container" />

      {/* 配置组件模块 */}
      <ConfigComponent />

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
