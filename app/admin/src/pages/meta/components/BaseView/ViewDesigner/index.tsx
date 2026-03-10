import React from 'react';
import { Form, Row, Col, Select } from 'antd';
import { ViewDto } from '@/api/meta/interface';
import { useMetaLists } from '@/store/metaListAtom';
import { useMetaSearchForms } from '@/store/metaSearchFormAtom';
import ViewConfigPanel from './components/ViewConfigPanel';
import type { ViewDesignerProps, ViewDesignerRef } from './types';

import './index.less';

const ViewDesigner: React.ForwardRefRenderFunction<ViewDesignerRef, ViewDesignerProps> = (
  props,
  ref
) => {
  const { height, activeView } = props;

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

  React.useImperativeHandle(ref, () => ({
    getFormData: async () => {
      const values = await form.validateFields();
      return {
        ...values,
        viewConfig,
      };
    },
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
