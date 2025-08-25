import { Button, Form, Input } from 'antd';
import React from 'react';

const Dashboard: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = values => {
    console.log(values);
  };

  React.useEffect(() => {
    form.setFieldsValue({
      metaPropertiesValue: [],
    });
  }, []);

  return (
    <>
      <Form form={form} onFinish={onFinish}>
        <Form.List name="metaPropertiesValue">
          {(fields, { add, remove }) => {
            return fields.map(field => {
              return (
                <Form.Item label="测试1" name={[field.name, '1']}>
                  <Input />
                </Form.Item>
              );
            });
            return (
              <>
                <Form.Item label="测试2" name={[field.name, '2']}>
                  <Input />
                </Form.Item>
                <Form.Item label="测试3" name={[field.name, '3']}>
                  <Input />
                </Form.Item>
              </>
            );
          }}
        </Form.List>
      </Form>
      <Button onClick={() => form.submit()}>Test</Button>
    </>
  );
};

export default Dashboard;
