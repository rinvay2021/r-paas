import React from 'react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, InputNumber, message, Row, Select } from 'antd';
// import { useMetaFormAtom } from '@/store/metaFormAtom';
import { DetailPageConfig, DetailPageDto, ListConfig, ListDto } from '@/api/meta/interface';
import { DETAIL_PAGE_OPTIONS } from '../constant';
import ConfigPanel from './components/ConfigPanel';
import type { ListDesignerRef, ListDesignerProps } from './types';
import './index.less';
import { useRequest } from 'ahooks';
import { metaService } from '@/api/meta';

const DetailPageDesigner: React.ForwardRefRenderFunction<
  ListDesignerRef,
  ListDesignerProps
> = (props, ref) => {
  const { refresh, height, activeList } = props;

  const [form] = Form.useForm<ListDto>();
  const [listConfig, setListConfig] = React.useState<ListConfig>();

  const { run: saveList } = useRequest(
    async () => {
      const lists = await form.validateFields();

      const listData = {
        ...lists,
        listConfig,
        _id: activeList?._id || '',
      };

      return metaService.updateList(listData);
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

  React.useImperativeHandle(ref, () => ({
    saveList,
  }));

  return (
    <div id="detailPage-designer" className="detailPage-designer" style={{ height }}>
      <div className="detailPage-designer-left">
        <div className="containers-wrapper selected">
          {/* 列表字段编辑 */}
        </div>
      </div>
      <div className="form-designer-right">
        <ConfigPanel config={listConfig} onChange={setListConfig} />
      </div>
    </div>
  );
};

export default React.forwardRef(DetailPageDesigner);
