import React from 'react';
import { find, get, map } from 'lodash';
import { useBoolean, useMemoizedFn } from 'ahooks';
import { Button, Empty, Flex, message, Space, Spin, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';

import { prefix } from '@/constant';
import { useElementHeight } from '@/hooks';
import { useMeta } from '@/store/metaAtom';
import { metaService } from '@/api/meta';
import { SearchFormDto } from '@/api/meta/interface';
import { META_PAGE_OFFSET, META_PAGE_TAB_HEIGHT } from '../../constant';
import SearchFormDesigner from './SearchFormDesigner';
import SearchFormPreview from './SearchFormPreview';
import type { SearchFormDesignerRef } from './SearchFormDesigner/types';
import {
  useMetaSearchForms,
  useLoadingSearchForms,
  useCurrentMetaSearchForm,
  useSetCurrentMetaSearchForm,
  useRefreshMetaSearchForms,
} from '@/store/metaSearchFormAtom';

import './index.less';

const SearchForm: React.FC = () => {
  const height = useElementHeight({
    elementId: 'meta-page-container',
    offset: META_PAGE_OFFSET,
  });

  const { appCode, metaObjectCode } = useMeta();

  const searchForms = useMetaSearchForms();
  const loading = useLoadingSearchForms();
  const activeSearchForm = useCurrentMetaSearchForm();
  const setActiveSearchForm = useSetCurrentMetaSearchForm();
  const refreshTrigger = useRefreshMetaSearchForms();

  const editingSearchFormRef = React.useRef<SearchFormDto | null>(null);
  const searchFormDesignerRef = React.useRef<SearchFormDesignerRef>(null);

  const [searchFormModalOpen, setSearchFormModalOpen] = React.useState(false);
  const [isEditing, { setTrue: setEditing, setFalse: setPreview }] = useBoolean(false);

  // TODO: 删除搜索表单
  const handleDeleteSearchForm = () => {
    // metaService.deleteSearchForm;
  };

  const handleSaveSearchForm = useMemoizedFn(() => {
    searchFormDesignerRef.current?.saveSearchForm?.();
  });

  const handleSettingSearchForm = useMemoizedFn(() => {
    const filter = sf => sf.searchFormCode === activeSearchForm?.searchFormCode;
    const editingSearchForm = find(searchForms, filter);

    if (!editingSearchForm) {
      message.info('搜索表单不存在');
      return;
    }

    editingSearchFormRef.current = editingSearchForm;
    setSearchFormModalOpen(true);
  });

  const onActiveSearchFormChange = useMemoizedFn((searchFormCode: string) => {
    const filter = sf => sf?.searchFormCode === searchFormCode;
    const activeSearchForm = find(searchForms, filter);

    if (!activeSearchForm) {
      message.info('搜索表单不存在');
      return;
    }

    setActiveSearchForm(activeSearchForm);
    setPreview();
  });

  const items = React.useMemo(() => {
    return map(searchForms, sf => ({
      key: sf?.searchFormCode,
      label: sf?.searchFormName,
      children: null,
    }));
  }, [searchForms]);

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
          <Empty description="暂无搜索表单，去添加一个吧">
            <Button type="primary" onClick={() => setSearchFormModalOpen(true)}>
              新建搜索表单
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
          activeKey={activeSearchForm?.searchFormCode}
          onChange={onActiveSearchFormChange}
          indicator={{ size: () => 20 }}
          className={`${prefix}-base-search-form-tabs`}
          tabBarExtraContent={{
            right: (
              <Space>
                <Button
                  type="dashed"
                  loading={loading}
                  icon={<PlusOutlined />}
                  onClick={() => {
                    editingSearchFormRef.current = null;
                    setSearchFormModalOpen(true);
                  }}
                >
                  新建搜索表单
                </Button>
                {isEditing && (
                  <>
                    <Button type="dashed" onClick={setPreview}>
                      取消
                    </Button>
                    <Button color="primary" variant="filled" onClick={handleSaveSearchForm}>
                      保存
                    </Button>
                  </>
                )}
              </Space>
            ),
          }}
        />
        {isEditing ? (
          <SearchFormDesigner
            ref={searchFormDesignerRef}
            refresh={refreshTrigger}
            height={height}
            activeSearchForm={activeSearchForm}
          />
        ) : (
          <SearchFormPreview
            height={height}
            onEdit={setEditing}
            onDelete={handleDeleteSearchForm}
            onSetting={handleSettingSearchForm}
          />
        )}
      </>
    );
  };

  return (
    <div className={`${prefix}-base-search-form`}>
      {/* 搜索表单内容 */}
      {renderContent()}

      {/* 新建/编辑搜索表单的表单 */}
      <ModalForm<SearchFormDto>
        title={editingSearchFormRef.current ? '编辑搜索表单' : '新建搜索表单'}
        open={searchFormModalOpen}
        onOpenChange={setSearchFormModalOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            editingSearchFormRef.current = null;
            setSearchFormModalOpen(false);
          },
        }}
        initialValues={editingSearchFormRef.current || undefined}
        onFinish={async values => {
          try {
            if (editingSearchFormRef.current) {
              await metaService.updateSearchForm({
                ...values,
                _id: editingSearchFormRef.current._id,
              });
              message.success('更新成功');
            } else {
              await metaService.createSearchForm({
                ...values,
                appCode,
                metaObjectCode,
                searchFormFields: [],
              });
              message.success('创建成功');
            }

            refreshTrigger();
            editingSearchFormRef.current = null;
            return true;
          } catch (error) {
            const errorMessage = get(error, 'message', '操作失败');
            message.error(errorMessage);
            return false;
          }
        }}
      >
        <ProFormText
          name="searchFormName"
          label="搜索表单名称"
          placeholder="请输入搜索表单名称"
          rules={[
            { required: true, message: '请输入搜索表单名称' },
            { max: 50, message: '搜索表单名称不能超过50个字符' },
          ]}
        />
        <ProFormText
          name="searchFormCode"
          label="搜索表单编码"
          placeholder="请输入搜索表单编码"
          disabled={!!editingSearchFormRef.current}
          rules={[
            { required: true, message: '请输入搜索表单编码' },
            {
              pattern: /^[A-Z][a-zA-Z0-9_]*$/,
              message: '以大写字母开头，只能包含字母、数字和下划线',
            },
            { max: 30, message: '搜索表单编码不能超过30个字符' },
          ]}
        />
        <ProFormTextArea
          name="searchFormDesc"
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

export default SearchForm;
