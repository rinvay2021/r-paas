import React from 'react';
import { map } from 'lodash';
import { useRequest } from 'ahooks';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, message, Row, Select, Switch } from 'antd';
import { metaService } from '@/api/meta';
import { DetailPageConfig, DetailPageDto } from '@/api/meta/interface';
import { useMetaFroms } from '@/store/metaFormAtom';
import { useMetaObjectListAtom } from '@/store/metaAtom';
import { ButtonSelector } from '@/pages/meta/biz-components/MetaButton';
import { ButtonLevel } from '@/pages/meta/components/FunctionButton/type';
import { COMPONENT_TYPE_OPTIONS, DETAIL_PAGE_OPTIONS } from '../constant';

import ConfigPanel from './components/ConfigPanel';
import ComponentSelect from './components/ComponentSelect';
import ComponentButtonSelect from './components/ComponentButtonSelect';
import type { DetailPageDesignerRef, DetailPageDesignerProps } from './types';

import './index.less';

const DetailPageDesigner: React.ForwardRefRenderFunction<
  DetailPageDesignerRef,
  DetailPageDesignerProps
> = (props, ref) => {
  const { refresh, height, activeDetail } = props;

  const forms = useMetaFroms();
  const metaObjectList = useMetaObjectListAtom();

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
      } as any;

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
    () => map(forms, list => ({ value: list.formCode, label: list.formName })),
    [forms]
  );

  const metaObjectOptions = React.useMemo(
    () => map(metaObjectList, list => ({ value: list.metaObjectCode, label: list.metaObjectName })),
    [metaObjectList]
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
                    <Form.Item label="功能按钮" tooltip="功能按钮（详情页）" name="buttons">
                      <ButtonSelector level={ButtonLevel.ListRow} />
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
                                  <Select
                                    options={metaObjectOptions}
                                    placeholder="请先选择关联对象"
                                    onChange={() => {
                                      form.setFieldValue(['containers', name, 'component'], undefined);
                                      form.setFieldValue(['containers', name, 'buttons'], undefined);
                                    }}
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item {...restField} label="组件标题" name={[name, 'title']}>
                                  <Input placeholder="请输入组件标题" />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item
                                  {...restField}
                                  label="组件类型"
                                  name={[name, 'componentType']}
                                >
                                  <Select
                                    options={COMPONENT_TYPE_OPTIONS}
                                    placeholder="请先选择组件类型"
                                    onChange={() => {
                                      form.setFieldValue(['containers', name, 'component'], undefined);
                                      form.setFieldValue(['containers', name, 'buttons'], undefined);
                                    }}
                                  />
                                </Form.Item>
                              </Col>
                              <Form.Item
                                noStyle
                                shouldUpdate={(prevValues, currentValues) => {
                                  return (
                                    prevValues?.containers?.[name]?.metaObjectCode !==
                                      currentValues?.containers?.[name]?.metaObjectCode ||
                                    prevValues?.containers?.[name]?.componentType !==
                                      currentValues?.containers?.[name]?.componentType
                                  );
                                }}
                              >
                                {() => (
                                  <Col span={12}>
                                    <Form.Item {...restField} label="组件" name={[name, 'component']}>
                                      <ComponentSelect
                                        metaObjectCode={form.getFieldValue([
                                          'containers',
                                          name,
                                          'metaObjectCode',
                                        ])}
                                        componentType={form.getFieldValue([
                                          'containers',
                                          name,
                                          'componentType',
                                        ])}
                                      />
                                    </Form.Item>
                                  </Col>
                                )}
                              </Form.Item>
                              <Col span={12}>
                                <Form.Item
                                  {...restField}
                                  label="编码"
                                  name={[name, 'componentCode']}
                                  rules={[{ required: true, message: '请输入编码' }]}
                                >
                                  <Input placeholder="请输入编码" />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item {...restField} label="排序" name={[name, 'order']}>
                                  <InputNumber />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item
                                  {...restField}
                                  label="是否可见"
                                  initialValue={true}
                                  name={[name, 'isVisible']}
                                >
                                  <Switch />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Form.Item
                              noStyle
                              shouldUpdate={(prevValues, currentValues) => {
                                return (
                                  prevValues?.containers?.[name]?.metaObjectCode !==
                                    currentValues?.containers?.[name]?.metaObjectCode ||
                                  prevValues?.containers?.[name]?.componentType !==
                                    currentValues?.containers?.[name]?.componentType
                                );
                              }}
                            >
                              {() => (
                                <Row gutter={16}>
                                  <Col span={12}>
                                    <Form.Item {...restField} label="功能按钮" name={[name, 'buttons']}>
                                      <ComponentButtonSelect
                                        metaObjectCode={form.getFieldValue([
                                          'containers',
                                          name,
                                          'metaObjectCode',
                                        ])}
                                        componentType={form.getFieldValue([
                                          'containers',
                                          name,
                                          'componentType',
                                        ])}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              )}
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
