import React from 'react';
import { map, find, isEmpty, get } from 'lodash';
import { useBoolean, useRequest } from 'ahooks';
import { Tabs, Button, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { prefix } from '@/constant';
import { metaService } from '@/api/meta';
import { FormDto } from '@/api/meta/interface';
import { MetaContext } from '@/pages/configurable/meta';
import PreviewForm from './FormPreview';
import FormDesigner from './FormDesigner';
import type { FormDesignerRef } from './FormDesigner/types';

import './index.less';

const BaseForm: React.FC = () => {
  const { appCode, metaObjectCode } = React.useContext(MetaContext);

  const editingFormRef = React.useRef<FormDto | null>(null);
  const formDesignerRef = React.useRef<FormDesignerRef>(null);

  const [activeFormCode, setActiveFormCode] = React.useState<string>();
  const [formModalOpen, setFormModalOpen] = React.useState<boolean>(false);
  const [isEditing, { setTrue: setEditing, setFalse: setPreview }] = useBoolean(false);

  const { data, loading, refresh } = useRequest(
    () =>
      metaService.queryForms({
        appCode,
        metaObjectCode,
      }),
    {
      refreshDeps: [appCode, metaObjectCode],
      onSuccess: data => {
        if (!isEmpty(data?.data?.list) && !activeFormCode) {
          setActiveFormCode(get(data, 'data.list[0].formCode'));
        }
      },
      onError: error => {
        message.error(error.message);
      },
    }
  );

  const handleSettingForm = () => {
    const filter = form => form.formCode === activeFormCode;
    const currentForm = find(data?.data?.list, filter);

    if (currentForm) {
      editingFormRef.current = currentForm;
      setFormModalOpen(true);
    } else {
      message.info('表单不存在');
    }
  };

  const handleDeleteForm = () => {
    // metaService.createActionButton;
    // console.log('handleDeleteForm');
  };

  const handleSaveForm = () => {
    if (typeof formDesignerRef.current?.saveForm === 'function') {
      formDesignerRef.current?.saveForm();
    }
  };

  const onActiveFormChange = (formCode: string) => {
    setActiveFormCode(formCode);
    setPreview();
  };

  const designerProps = React.useMemo(() => {
    const filter = form => form.formCode === activeFormCode;
    const currentForm = find(data?.data?.list, filter);

    return {
      refresh,
      ...currentForm,
    };
  }, [data, activeFormCode, refresh]);

  const items = map(data?.data?.list || [], form => ({
    key: form.formCode,
    label: form.formName,
    children: null,
  }));

  return (
    <div className={`${prefix}-base-form`}>
      <Tabs
        size="small"
        id="form-container"
        items={items}
        activeKey={activeFormCode}
        onChange={onActiveFormChange}
        indicator={{ size: () => 20 }}
        className={`${prefix}-base-form-tabs`}
        tabBarExtraContent={{
          right: (
            <Space>
              <Button
                type="dashed"
                loading={loading}
                icon={<PlusOutlined />}
                onClick={() => {
                  editingFormRef.current = null;
                  setFormModalOpen(true);
                }}
              >
                新建表单
              </Button>
              {isEditing ? (
                <>
                  <Button type="dashed" onClick={setPreview}>
                    取消
                  </Button>
                  <Button color="primary" variant="filled" onClick={handleSaveForm}>
                    保存
                  </Button>
                </>
              ) : null}
            </Space>
          ),
        }}
      />

      {isEditing ? (
        <FormDesigner ref={formDesignerRef} {...designerProps} />
      ) : (
        <PreviewForm
          onEdit={setEditing}
          onDelete={handleDeleteForm}
          onSetting={handleSettingForm}
        />
      )}

      <ModalForm<FormDto>
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
            const errorMessage = get(error, 'message', '操作失败');
            message.error(errorMessage);
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
