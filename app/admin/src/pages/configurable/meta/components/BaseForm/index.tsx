import React, { useState, useRef } from 'react';
import { map, find } from 'lodash';
import { Tabs, Button, message } from 'antd';
import { useBoolean, useRequest } from 'ahooks';
import { useParams } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { StringParam, useQueryParam } from 'use-query-params';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { prefix } from '@/constant';
import { metaService } from '@/api/meta';
import PreviewForm from './PreviewForm';
import FormDesigner from './FormDesigner';
import './index.less';

interface FormItem {
  _id: string;
  formName: string;
  formCode: string;
  formDesc?: string;
}

const BaseForm: React.FC = () => {
  const { appCode } = useParams<{ appCode: string }>();
  const [metaObjectCode] = useQueryParam('metaObjectCode', StringParam);
  const [activeFormCode, setActiveFormCode] = useState<string>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
  const editingFormRef = useRef<FormItem | null>(null);

  const { data, loading, refresh } = useRequest(
    () =>
      metaService.queryForms({
        appCode,
        metaObjectCode,
      }),
    {
      refreshDeps: [appCode, metaObjectCode],
      onSuccess: data => {
        if (data?.data?.list?.length > 0 && !activeFormCode) {
          setActiveFormCode(data.data.list[0].formCode);
        }
      },
      onError: error => {
        message.error(error.message);
      },
    }
  );

  const handleSettingForm = () => {
    const currentForm = find(data?.data?.list, form => form.formCode === activeFormCode);
    if (currentForm) {
      editingFormRef.current = currentForm;
      setFormModalOpen(true);
    } else {
      message.info('表单不存在');
    }
  };

  const items = map(data?.data?.list || [], form => ({
    key: form.formCode,
    label: form.formName,
    children: null,
  }));

  const onActiveFormChange = (formCode: string) => {
    setActiveFormCode(formCode);
    setIsEditing(false);
  };

  return (
    <div className={`${prefix}-base-form`}>
      <Tabs
        items={items}
        activeKey={activeFormCode}
        onChange={onActiveFormChange}
        indicator={{ size: () => 20 }}
        className={`${prefix}-base-form-tabs`}
        tabBarExtraContent={{
          right: (
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                editingFormRef.current = null;
                setFormModalOpen(true);
              }}
            >
              新建表单
            </Button>
          ),
        }}
      />
      {!loading && (
        <>
          {isEditing ? (
            <FormDesigner />
          ) : (
            <PreviewForm onEdit={() => setIsEditing(true)} onSetting={handleSettingForm} />
          )}
        </>
      )}

      <ModalForm<FormItem>
        title={editingFormRef.current ? '编辑表单' : '新建表单'}
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            editingFormRef.current = null;
            setFormModalOpen(false);
          },
        }}
        initialValues={editingFormRef.current || undefined}
        onFinish={async values => {
          try {
            if (editingFormRef.current) {
              await metaService.updateForm({
                ...values,
                _id: editingFormRef.current._id,
              });
              message.success('更新成功');
            } else {
              await metaService.createForm({
                ...values,
                appCode,
                metaObjectCode,
              });
              message.success('创建成功');
            }
            refresh();
            editingFormRef.current = null;
            return true;
          } catch (error) {
            message.error(editingFormRef.current ? '更新失败' : '创建失败');
            return false;
          }
        }}
      >
        <ProFormText
          name="formName"
          label="表单名称"
          placeholder="请输入表单名称"
          rules={[
            { required: true, message: '请输入表单名称' },
            { max: 50, message: '表单名称不能超过50个字符' },
          ]}
        />
        <ProFormText
          name="formCode"
          label="表单编码"
          placeholder="请输入表单编码"
          disabled={!!editingFormRef.current}
          rules={[
            { required: true, message: '请输入表单编码' },
            {
              pattern: /^[A-Z][a-zA-Z0-9_]*$/,
              message: '以大写字母开头，只能包含字母、数字和下划线',
            },
            { max: 30, message: '表单编码不能超过30个字符' },
          ]}
        />
        <ProFormTextArea
          name="formDesc"
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

export default BaseForm;
