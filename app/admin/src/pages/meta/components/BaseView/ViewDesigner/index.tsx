import React from 'react';
import { useRequest } from 'ahooks';
import { Form, Row, Col, Select, message } from 'antd';
import { ViewDto } from '@/api/meta/interface';
import { useMetaLists } from '@/store/metaListAtom';
import { useMetaSearchForms } from '@/store/metaSearchFormAtom';
import { ButtonSelector } from '@/pages/meta/biz-components/MetaButton';
import { ButtonLevel } from '@r-paas/meta';
import { metaService } from '@/api/meta';
import ViewConfigPanel from './components/ViewConfigPanel';
import type { ViewDesignerProps, ViewDesignerRef } from './types';

import './index.less';

const ViewDesigner: React.ForwardRefRenderFunction<ViewDesignerRef, ViewDesignerProps> = (
  props,
  ref
) => {
  const { height, activeView, refresh } = props;

  const lists = useMetaLists();
  const searchForms = useMetaSearchForms();

  const [form] = Form.useForm<ViewDto>();
  const [viewConfig, setViewConfig] = React.useState<any>();

  React.useEffect(() => {
    form.setFieldsValue(activeView);
    setViewConfig(activeView?.viewConfig);
  }, [form, activeView]);

  const listOptions = React.useMemo(
    () => lists.map(list => ({ value: list.listCode, label: list.listName })),
    [lists]
  );

  const searchFormOptions = React.useMemo(
    () => searchForms.map(form => ({ value: form.searchFormCode, label: form.searchFormName })),
    [searchForms]
  );

  const { run: saveView } = useRequest(
    async () => {
      const values = await form.validateFields();
      const viewData = {
        ...values,
        viewConfig,
        _id: activeView?._id,
      };

      return metaService.updateView(viewData);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('保存成功');
        refresh?.();
      },
      onError: (error: any) => {
        message.error(error.message || '保存失败');
      },
    }
  );

  React.useImperativeHandle(ref, () => ({
    saveView,
  }));

  return (
    <div className="view-designer" style={{ height }}>
      <div className="view-designer-left">
        <div className="containers-wrapper selected">
          <Form labelCol={{ span: 4 }} form={form} variant="filled">
            <div className="container">
              <div className="container-header">
                <div className="container-title">视图配置</div>
                <div className="container-actions"></div>
              </div>
              <div className="container-content">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="searchFormCode" label="搜索表单" rules={[{ required: true }]}>
                      <Select options={searchFormOptions} placeholder="请选择搜索表单" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="listCode" label="列表" rules={[{ required: true }]}>
                      <Select options={listOptions} placeholder="请选择列表" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="buttons"
                      layout="horizontal"
                      tooltip="配置视图功能按钮"
                      label="功能按钮"
                    >
                      <ButtonSelector level={ButtonLevel.View} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </div>
          </Form>
        </div>
      </div>
      <div className="view-designer-right">
        <ViewConfigPanel config={viewConfig} onChange={setViewConfig} />
      </div>
    </div>
  );
};

export default React.forwardRef(ViewDesigner);
