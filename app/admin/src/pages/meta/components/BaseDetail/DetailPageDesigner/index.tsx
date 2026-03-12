import React from 'react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, message, Row, Select } from 'antd';
// import { useMetaFormAtom } from '@/store/metaFormAtom';
import { DetailPageConfig, DetailPageDto } from '@/api/meta/interface';
import { DETAIL_PAGE_OPTIONS } from '../constant';
import ConfigPanel from './components/ConfigPanel';
import type { DetailPageDesignerRef, DetailPageDesignerProps } from './types';
import './index.less';
import { useRequest } from 'ahooks';
import { metaService } from '@/api/meta';
import { useMetaFroms } from '@/store/metaFormAtom';

const DetailPageDesigner: React.ForwardRefRenderFunction<
  DetailPageDesignerRef,
  DetailPageDesignerProps
> = (props, ref) => {
  const { refresh, height, activeDetail } = props;

  const forms = useMetaFroms();
  const [form] = Form.useForm<DetailPageDto>();
  const [detailPageConfig, setDetailPageConfig] = React.useState<DetailPageConfig>();

  React.useEffect(() => {
    const [mainContainer, ...restContainers] = activeDetail?.containers || [];

    form.setFieldsValue({
      ...mainContainer,
      containers: restContainers,
    });

    setDetailPageConfig(activeDetail?.detailPageConfig);
  }, [form, activeDetail]);

  const { run: saveDetail } = useRequest(
    async () => {
      const details = await form.validateFields();
      const { containers, ...restParams } = details;

      const detailPageData = {
        _id: activeDetail?._id || '',
        formCode: restParams?.formCode,
        containers: [restParams, ...containers],
        detailPageConfig,
      };

      return metaService.updateDetailPage(detailPageData);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('保存成功');
        refresh();
      },
      onError: error => {
        message.error(error.message || '保存失败');
      },
    }
  );

  const formsOptions = React.useMemo(
    () => forms.map(list => ({ value: list.formCode, label: list.formName })),
    [forms]
  );

  React.useImperativeHandle(ref, () => ({
    saveDetail,
  }));

  return (
    <div id="detailPage-designer" className="detailPage-designer" style={{ height }}>
      <div className="detailPage-designer-left">
        <div className="containers-wrapper selected">
          <Form labelCol={{ span: 4 }} form={form} variant="filled">
            {/* 主对象配置 */}
            <div className="container">
              <div className="container-header">
                <div className="container-title">对象配置（主）</div>
                <div className="container-actions"></div>
              </div>
              <div className="container-content">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="对象表单" name="formCode">
                      <Select options={formsOptions} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="页面类型" name="pageType">
                      <Select options={DETAIL_PAGE_OPTIONS} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="功能按钮" name="buttons">
                      <Select options={DETAIL_PAGE_OPTIONS} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </div>
            {/* 子对象配置 */}
            <Form.List name="containers">
              {(fields, { add, remove }) => {
                return (
                  <>
                    {fields.map(({ key, name, ...restField }) => {
                      return (
                        <div key={key} className="container">
                          <div className="container-header">
                            <div className="container-title">对象配置（子）</div>
                            <div className="container-actions">
                              <Button
                                type="link"
                                icon={<DeleteOutlined />}
                                onClick={() => remove(name)}
                              />
                            </div>
                          </div>
                          <div className="container-content">
                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item
                                  {...restField}
                                  label="关联对象"
                                  name={[name, 'metaObjectCode']}
                                >
                                  <Select options={formsOptions} />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item {...restField} label="页面标题" name={[name, 'title']}>
                                  <Input />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item
                                  {...restField}
                                  label="关联表单"
                                  name={[name, 'componentType']}
                                >
                                  <Select options={formsOptions} />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item {...restField} label="编码" name={[name, 'code']}>
                                  <Input />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item {...restField} label="排序" name={[name, 'order']}>
                                  <InputNumber />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item
                                  {...restField}
                                  label="是否默认显示"
                                  name={[name, 'defaultExpand']}
                                >
                                  <Select options={DETAIL_PAGE_OPTIONS} />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item {...restField} label="功能按钮" name={[name, 'buttons']}>
                                  <Select options={DETAIL_PAGE_OPTIONS} />
                                </Form.Item>
                              </Col>
                            </Row>
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      block
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => add({})}
                      style={{ marginTop: 16 }}
                    >
                      添加子对象
                    </Button>
                  </>
                );
              }}
            </Form.List>
          </Form>
        </div>
      </div>
      <div className="form-designer-right">
        <ConfigPanel config={activeDetail?.detailPageConfig} onChange={setDetailPageConfig} />
      </div>
    </div>
  );
};

export default React.forwardRef(DetailPageDesigner);
