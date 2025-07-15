import React from 'react';
import { get, map } from 'lodash';
import { useRequest } from 'ahooks';
import { Button, message, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';

import { prefix } from '@/constant';
import { metaService } from '@/api/meta';
import { DetailPageDto } from '@/api/meta/interface';
import { MetaContext } from '@/pages/configurable/meta';

import { useFormData } from '../BaseForm/useFormData';

const BaseDetail: React.FC = () => {
  const { appCode, metaObjectCode } = React.useContext(MetaContext);

  const editingDetailRef = React.useRef<DetailPageDto | null>(null);

  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [activeDetailCode, setActiveDetailCode] = React.useState<string>();

  const { options } = useFormData();

  const { data, loading, refresh } = useRequest(() =>
    metaService.queryDetailPages({
      appCode,
      metaObjectCode,
    })
  );

  const onActiveDetailChange = (detailCode: string) => {
    setActiveDetailCode(detailCode);
  };

  const items = React.useMemo(() => {
    return map(data?.data?.list || [], detail => ({
      key: detail.detailPageCode,
      label: detail.detailPageName,
      children: null,
    }));
  }, [data]);

  return (
    <div className={`${prefix}-base-detail`}>
      <Tabs
        size="small"
        id="detail-container"
        items={items}
        activeKey={activeDetailCode}
        onChange={onActiveDetailChange}
        indicator={{ size: () => 20 }}
        className={`${prefix}-base-detail-tabs`}
        tabBarExtraContent={{
          right: (
            <Button
              type="dashed"
              loading={loading}
              icon={<PlusOutlined />}
              onClick={() => {
                setDetailModalOpen(true);
              }}
            >
              新建详情页
            </Button>
          ),
        }}
      />

      <ModalForm<DetailPageDto>
        title={editingDetailRef.current ? '编辑详情页' : '新建详情页'}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            editingDetailRef.current = null;
            setDetailModalOpen(false);
          },
        }}
        initialValues={editingDetailRef.current || undefined}
        onFinish={async values => {
          try {
            if (editingDetailRef.current) {
              // await metaService.updateDetailPage({
              //   ...values,
              //   _id: editingDetailRef.current._id,
              // });
              // message.success('更新成功');
            } else {
              await metaService.createDetailPage({
                ...values,
                appCode,
                metaObjectCode,
              });
              message.success('创建成功');
            }

            refresh();
            editingDetailRef.current = null;
            return true;
          } catch (error) {
            const errorMessage = get(error, 'message', '操作失败');
            message.error(errorMessage);
            return false;
          }
        }}
      >
        <ProFormText
          name="detailPageName"
          label="详情页名称"
          placeholder="请输入详情页名称"
          rules={[
            { required: true, message: '请输入详情页名称' },
            { max: 50, message: '详情页名称不能超过50个字符' },
          ]}
        />
        <ProFormText
          name="detailPageCode"
          label="详情页编码"
          placeholder="请输入详情页编码"
          disabled={!!editingDetailRef.current}
          rules={[
            { required: true, message: '请输入表单编码' },
            {
              pattern: /^[A-Z][a-zA-Z0-9_]*$/,
              message: '以大写字母开头，只能包含字母、数字和下划线',
            },
            { max: 30, message: '详情页编码不能超过30个字符' },
          ]}
        />
        <ProFormSelect
          name="formCode"
          label="基础表单"
          options={options}
          rules={[{ required: true, message: '请选择基础表单' }]}
        />
        <ProFormTextArea
          name="detailPageDesc"
          label="描述"
          placeholder="请输入描述信息"
          fieldProps={{
            maxLength: 200,
            showCount: true,
            rows: 4,
          }}
        />
      </ModalForm>
    </div>
  );
};

export default BaseDetail;
