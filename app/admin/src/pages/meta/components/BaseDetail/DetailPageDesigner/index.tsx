import React from 'react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, Row, Select } from 'antd';
import { useMetaFormAtom } from '@/store/metaFormAtom';
import { DetailPageConfig, DetailPageDto } from '@/api/meta/interface';
import { DETAIL_PAGE_OPTIONS } from '../constant';
import ConfigPanel from './components/ConfigPanel';
import type { DetailPageDesignerRef, DetailPageDesignerProps } from './types';
import './index.less';

const DetailPageDesigner: React.ForwardRefRenderFunction<
  DetailPageDesignerRef,
  DetailPageDesignerProps
> = (props, ref) => {
  const { refresh, height, activeDetail } = props;

  const [form] = Form.useForm<DetailPageDto>();

  const { options } = useMetaFormAtom();
  const [detailPageConfig, setDetailPageConfig] = React.useState<DetailPageConfig>();

  React.useEffect(() => {
    form.setFieldsValue(activeDetail);
    setDetailPageConfig(activeDetail?.detailPageConfig);
  }, [form, activeDetail]);

  React.useImperativeHandle(ref, () => ({
    saveDetail: () => {
      // TODO: 保存详情页配置
    },
  }));

  return (
    <div id="detailPage-designer" className="detailPage-designer" style={{ height }}>
      <div className="detailPage-designer-left">
        <Form labelCol={{ span: 4 }} form={form} variant="filled">
          <div className="containers-wrapper selected">
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
                      <Select options={options} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="页面类型" name="pageType">
                      <Select options={DETAIL_PAGE_OPTIONS} />
                    </Form.Item>
                  </Col>
                </Row>
                {/* TODO */}
                <Form.Item label="功能按钮" name="buttons"></Form.Item>
              </div>
            </div>
            {/* 子对象配置 */}
            <Form.List name="containers">
              {(fields, { add, remove }) => {
                return (
                  <>
                    {fields.map(({ key, name, ...restField }) => {
                      return (
                        <div className="container">
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
                                  <Select options={options} />
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
                                  label="关联控件"
                                  name={[name, 'componentType']}
                                >
                                  <Select options={options} />
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
                            <Form.Item {...restField} label="功能按钮" name={[name, 'buttons']}>
                              {/* TODO */}
                              {/* <Select options={DETAIL_PAGE_OPTIONS} /> */}
                            </Form.Item>
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
          </div>
        </Form>
      </div>
      <div className="form-designer-right">
        <ConfigPanel config={detailPageConfig} onChange={setDetailPageConfig} />
      </div>
    </div>
  );
};

export default React.forwardRef(DetailPageDesigner);
