import React from 'react';
import { map, find, isEmpty, get } from 'lodash';
import { useBoolean, useMemoizedFn, useRequest } from 'ahooks';
import { Tabs, Button, message, Space, Spin, Flex, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { prefix } from '@/constant';
import { useElementHeight } from '@/hooks';
import { metaService } from '@/api/meta';
import { FormDto } from '@/api/meta/interface';
import { useMeta } from '@/store/metaAtom';
import { META_PAGE_OFFSET, META_PAGE_TAB_HEIGHT } from '../../constant';
import PreviewForm from './FormPreview';
import FormDesigner from './FormDesigner';
import type { FormDesignerRef } from './FormDesigner/types';

import './index.less';
import {
  useCurrentMetaForm,
  useLoadingForms,
  useMetaFroms,
  useRefreshMetaForms,
  useSetCurrentMetaForm,
} from '@/store/metaFormAtom';

const BaseForm: React.FC = () => {
  const height = useElementHeight({
    elementId: 'meta-page-container',
    offset: META_PAGE_OFFSET,
  });
  const { appCode, metaObjectCode } = useMeta();

  const froms = useMetaFroms();
  const loading = useLoadingForms();
  const activeForm = useCurrentMetaForm();
  const setActiveForm = useSetCurrentMetaForm();
  const refreshTrigger = useRefreshMetaForms();

  const editingFormRef = React.useRef<FormDto | null>(null);
  const formDesignerRef = React.useRef<FormDesignerRef>(null);

  const [formModalOpen, setFormModalOpen] = React.useState<boolean>(false);
  const [isEditing, { setTrue: setEditing, setFalse: setPreview }] = useBoolean(false);

  const handleSettingForm = useMemoizedFn(() => {
    const filter = form => form.formCode === activeForm?.formCode;
    const editingForm = find(froms, filter);

    if (editingForm) {
      editingFormRef.current = editingForm;
      setFormModalOpen(true);
    } else {
      message.info('表单不存在');
    }
  });

  const handleDeleteForm = useMemoizedFn(async () => {
    try {
      await metaService.deleteForm(activeForm?._id);
      message.success('删除成功');
      refreshTrigger();
    } catch (error) {
      message.error(error?.message || '删除失败');
    }
  });

  const handleSaveForm = useMemoizedFn(() => {
    formDesignerRef.current?.saveForm?.();
  });

  const onActiveFormChange = useMemoizedFn((formCode: string) => {
    const filter = form => form.formCode === formCode;
    const activeForm = find(froms, filter);

    if (!activeForm) {
      message.info('表单不存在');
      return;
    }

    setActiveForm(activeForm);
    setPreview();
  });

  const items = React.useMemo(
    () =>
      map(froms || [], form => ({
        key: form.formCode,
        label: form.formName,
        children: null,
      })),
    [froms]
  );

  const renderContent = () => {
    if (loading) {
      return <Spin spinning={loading} />;
    }

    if (items.length === 0) {
      return (
        <Flex
          align="center"
          justify="center"
          style={{ height: `${height + META_PAGE_TAB_HEIGHT}px` }}
        >
          <Empty description="暂无详情页，去添加一个吧">
            <Button type="primary" onClick={() => setFormModalOpen(true)}>
              新建表单
            </Button>
          </Empty>
        </Flex>
      );
    }

    return (
      <>
        <Tabs
          size="small"
          items={items}
          activeKey={activeForm?.formCode}
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
                {isEditing && (
                  <>
                    <Button type="dashed" onClick={setPreview}>
                      取消
                    </Button>
                    <Button color="primary" variant="filled" onClick={handleSaveForm}>
                      保存
                    </Button>
                  </>
                )}
              </Space>
            ),
          }}
        />
        {isEditing ? (
          <FormDesigner
            ref={formDesignerRef}
            refresh={refreshTrigger}
            height={height}
            activeForm={activeForm}
          />
        ) : (
          <PreviewForm
            height={height}
            onEdit={setEditing}
            onDelete={handleDeleteForm}
            onSetting={handleSettingForm}
          />
        )}
      </>
    );
  };

  return (
    <div className={`${prefix}-base-form`}>
      {/* 详情页内容 */}
      {renderContent()}

      {/* 新建/编辑表单的表单 */}
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
            refreshTrigger();
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
