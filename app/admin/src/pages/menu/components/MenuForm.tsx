import React, { useEffect, useMemo } from 'react';
import { Form, Input, TreeSelect, Select, Button, Space, Empty, Divider } from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuDto } from '@/api/meta/interface';
import { useMetaViews } from '@/store/metaViewAtom';
import './MenuForm.less';

const { TextArea } = Input;

interface MenuFormProps {
  menu: MenuDto | null;
  menus: MenuDto[];
  onSave: (values: Partial<MenuDto>) => Promise<void>;
  onDelete: () => Promise<void>;
}

const MenuForm: React.FC<MenuFormProps> = ({ menu, menus, onSave, onDelete }) => {
  const [form] = Form.useForm();
  const views = useMetaViews();

  // 初始化表单值
  useEffect(() => {
    if (menu) {
      // 先重置表单，清空所有字段
      form.resetFields();
      // 然后设置新的值
      form.setFieldsValue({
        menuName: menu.menuName,
        menuCode: menu.menuCode,
        parentId: menu.parentId || null,
        viewCode: menu.viewCode || null,
        menuDesc: menu.menuDesc || '',
      });
    } else {
      form.resetFields();
    }
  }, [menu, form]);

  // 父菜单选项（只显示一级菜单）
  const parentMenuOptions = useMemo(() => {
    return menus
      .filter(m => m.level === 1 && m._id !== menu?._id)
      .map(m => ({
        value: m._id,
        title: m.menuName,
      }));
  }, [menus, menu]);

  // 视图选项
  const viewOptions = useMemo(() => {
    return views.map(v => ({
      value: v.viewCode,
      label: v.viewName,
    }));
  }, [views]);

  // 保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values);
    } catch (error) {
      console.error('表单验证失败', error);
    }
  };

  // 删除
  const handleDelete = async () => {
    await onDelete();
  };

  if (!menu) {
    return (
      <div className="menu-form-empty">
        <Empty description="请在左侧选择一个菜单进行编辑" />
      </div>
    );
  }

  return (
    <div className="menu-form-wrapper">
      <div className="menu-form-content">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            parentId: null,
          }}
        >
          <Form.Item
            name="menuName"
            label="菜单名称"
            rules={[
              { required: true, message: '请输入菜单名称' },
              { max: 50, message: '菜单名称不能超过50个字符' },
            ]}
          >
            <Input placeholder="请输入菜单名称" size="large" />
          </Form.Item>

          <Form.Item
            name="menuCode"
            label="菜单编码"
            rules={[
              { required: true, message: '请输入菜单编码' },
              {
                pattern: /^[A-Z][a-zA-Z0-9_]*$/,
                message: '以大写字母开头，只能包含字母、数字和下划线',
              },
              { max: 30, message: '菜单编码不能超过30个字符' },
            ]}
          >
            <Input placeholder="请输入菜单编码" disabled={!!menu?._id} size="large" />
          </Form.Item>

          <Form.Item name="parentId" label="父菜单" tooltip="选择父菜单后，该菜单将成为二级菜单">
            <TreeSelect
              showSearch
              size="large"
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="请选择父菜单（留空则为一级菜单）"
              allowClear
              treeDefaultExpandAll
              treeData={parentMenuOptions}
            />
          </Form.Item>

          <Form.Item name="viewCode" label="关联视图" tooltip="选择该菜单要展示的视图">
            <Select
              showSearch
              allowClear
              size="large"
              placeholder="请选择关联视图"
              options={viewOptions}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item name="menuDesc" label="描述">
            <TextArea
              rows={4}
              placeholder="请输入菜单描述"
              maxLength={200}
              showCount
              size="large"
            />
          </Form.Item>
        </Form>
      </div>

      <Divider style={{ margin: 0 }} />

      <div className="menu-form-footer">
        <Space>
          <Button type="default" icon={<SaveOutlined />} onClick={handleSave}>
            保存
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
            删除
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default MenuForm;
