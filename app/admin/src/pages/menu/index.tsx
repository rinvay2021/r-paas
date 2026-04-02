import React from 'react';
import { atom, useAtom } from 'jotai';
import { Button, message, Modal, Form, Input, TreeSelect, Select, Space } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useMemoizedFn } from 'ahooks';
import { useParams } from 'react-router-dom';
import { prefix } from '@/constant';
import { metaService } from '@/api/meta';
import {
  useInitMenuList,
  useMenuList,
  useCurrentMenu,
  useSetCurrentMenu,
  useLoadingMenus,
  useRefreshMenus,
} from '@/store/menuAtom';
import type { MenuDto, MenuPositionDto } from '@/api/meta/interface';
import MenuTree from './components/MenuTree';
import MenuForm from './components/MenuForm';

import './index.less';

const { TextArea } = Input;

const viewsAtom = atom([]);

const Menu: React.FC = () => {
  const { appCode } = useParams<{ appCode: string }>();
  const [form] = Form.useForm();
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [pendingChanges, setPendingChanges] = React.useState<MenuPositionDto[] | null>(null);

  // 初始化菜单列表
  useInitMenuList();

  const menus = useMenuList();
  const currentMenu = useCurrentMenu();
  const loading = useLoadingMenus();
  const refreshMenus = useRefreshMenus();
  const setCurrentMenu = useSetCurrentMenu();
  const [views, setViews] = useAtom(viewsAtom);

  // 加载所有视图数据（不限定 metaObjectCode）
  React.useEffect(() => {
    if (!appCode) return;

    const loadViews = async () => {
      try {
        const result = await metaService.queryViews({
          appCode,
          // 不传 metaObjectCode，加载所有对象的视图
        });
        setViews(result?.data?.list || []);
      } catch (error) {
        console.error('加载视图列表失败', error);
        setViews([]);
      }
    };

    loadViews();
  }, [appCode, setViews]);

  // 父菜单选项（只显示一级菜单）
  const parentMenuOptions = React.useMemo(() => {
    return menus
      .filter(m => m.level === 1)
      .map(m => ({
        value: m._id,
        title: m.menuName,
      }));
  }, [menus]);

  // 视图选项
  const viewOptions = React.useMemo(() => {
    return views.map(v => ({
      value: v.viewCode,
      label: v.viewName,
    }));
  }, [views]);

  // 打开新建菜单弹窗
  const handleOpenCreateModal = useMemoizedFn(() => {
    form.resetFields();

    // 根据当前选中的菜单智能设置父菜单
    let defaultParentId = null;

    if (currentMenu) {
      if (currentMenu.level === 1) {
        // 如果选中的是一级菜单，新建为其子菜单
        defaultParentId = currentMenu._id;
      } else if (currentMenu.level === 2) {
        // 如果选中的是二级菜单，新建为同级菜单（同一个父菜单）
        defaultParentId = currentMenu.parentId;
      }
    }

    form.setFieldsValue({
      parentId: defaultParentId,
    });

    setCreateModalOpen(true);
  });

  // 创建菜单
  const handleCreateMenu = useMemoizedFn(async () => {
    if (!appCode) {
      message.error('应用编码不能为空');
      return;
    }
    try {
      const values = await form.validateFields();
      await metaService.createMenu({
        ...values,
        appCode,
      });
      message.success('创建成功');
      setCreateModalOpen(false);
      form.resetFields();
      refreshMenus();
    } catch (error: any) {
      if (error?.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(error?.message || '创建失败');
    }
  });

  // 选择菜单
  const handleSelectMenu = useMemoizedFn((menu: MenuDto) => {
    setCurrentMenu(menu);
  });

  // 保存菜单
  const handleSaveMenu = useMemoizedFn(async (values: Partial<MenuDto>) => {
    try {
      if (currentMenu?._id) {
        // 更新菜单
        await metaService.updateMenu({
          ...values,
          _id: currentMenu._id,
        });
        message.success('更新成功');
      }
      refreshMenus();
    } catch (error: any) {
      message.error(error?.message || '操作失败');
    }
  });

  // 删除菜单
  const handleDeleteMenu = useMemoizedFn(async () => {
    if (!currentMenu?._id) {
      message.warning('请先选择要删除的菜单');
      return;
    }

    // 检查是否有子菜单
    const hasChildren = menus.some(m => m.parentId === currentMenu._id);
    if (hasChildren) {
      message.warning('该菜单下有子菜单，无法删除');
      return;
    }

    Modal.confirm({
      title: '删除确认',
      content: `确定要删除菜单"${currentMenu.menuName}"吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 软删除：更新 isDelete 字段
          await metaService.updateMenu({
            _id: currentMenu._id!,
            isDelete: true,
          });
          message.success('删除成功');
          setCurrentMenu(null);
          refreshMenus();
        } catch (error: any) {
          message.error(error?.message || '删除失败');
        }
      },
    });
  });

  // 拖拽完成后实时更新本地状态
  const handleDragComplete = useMemoizedFn((updatedMenus: MenuDto[]) => {
    // 计算位置变更
    const menuPositions = updatedMenus.map((menu, index) => ({
      _id: menu._id!,
      parentId: menu.parentId || null,
      orderNum: menu.orderNum,
    }));

    setPendingChanges(menuPositions);
    message.info('拖拽完成，请点击右上角"保存"按钮保存变更');
  });

  // 保存拖拽变更
  const handleSaveChanges = useMemoizedFn(async () => {
    if (!appCode) {
      message.error('应用编码不能为空');
      return;
    }
    if (!pendingChanges) {
      message.info('没有需要保存的变更');
      return;
    }

    try {
      await metaService.saveMenuList({
        appCode,
        menus: pendingChanges,
      });
      message.success('保存成功');
      setPendingChanges(null);
      refreshMenus();
    } catch (error: any) {
      message.error(error?.message || '保存失败');
    }
  });

  return (
    <div className={`${prefix}-menu-config`}>
      <div className={`${prefix}-menu-config-header`}>
        <div className={`${prefix}-menu-config-title`}>菜单配置</div>
        <Space>
          {pendingChanges && (
            <Button type="default" icon={<SaveOutlined />} onClick={handleSaveChanges} danger>
              保存变更
            </Button>
          )}
          <Button
            type="default"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateModal}
            loading={loading}
          >
            新建菜单
          </Button>
        </Space>
      </div>
      <div className={`${prefix}-menu-config-body`}>
        <div className={`${prefix}-menu-config-left`}>
          <div className={`${prefix}-menu-config-section-title`}>菜单结构</div>
          <MenuTree
            menus={menus}
            selectedMenu={currentMenu}
            onSelect={handleSelectMenu}
            onDragComplete={handleDragComplete}
          />
        </div>
        <div className={`${prefix}-menu-config-right`}>
          <div className={`${prefix}-menu-config-section-title`}>菜单详情</div>
          <MenuForm
            menu={currentMenu}
            menus={menus}
            onSave={handleSaveMenu}
            onDelete={handleDeleteMenu}
          />
        </div>
      </div>

      {/* 新建菜单弹窗 */}
      <Modal
        title="新建菜单"
        open={createModalOpen}
        onOk={handleCreateMenu}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        width={600}
        okText="创建"
        cancelText="取消"
      >
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
            <Input placeholder="请输入菜单名称" />
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
            <Input placeholder="请输入菜单编码" />
          </Form.Item>

          <Form.Item name="parentId" label="父菜单" tooltip="选择父菜单后，该菜单将成为二级菜单">
            <TreeSelect
              showSearch
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
              placeholder="请选择关联视图"
              options={viewOptions}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item name="menuDesc" label="描述">
            <TextArea rows={4} placeholder="请输入菜单描述" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Menu;
