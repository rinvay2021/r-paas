import React from 'react';
import { useRequest } from 'ahooks';
import { message } from 'antd';
import { metaService } from '@/api/meta';

import ConfigPanel from './components/ConfigPanel';
import ListFieldEditor from './components/ListFieldEditor';
import type {
  ListDesignerRef,
  ListDesignerProps,
  ListConfigRef,
  ListFieldEditorRef,
} from './types';

import './index.less';

const ListDesigner: React.ForwardRefRenderFunction<ListDesignerRef, ListDesignerProps> = (
  props,
  ref
) => {
  const { refresh, height, activeList } = props;

  const listConfigRef = React.useRef<ListConfigRef>(null);
  const listFieldEditorRef = React.useRef<ListFieldEditorRef>(null);

  const { run: saveList } = useRequest(
    async () => {
      const listConfig = listConfigRef.current?.getListConfig();
      const listFields = listFieldEditorRef.current?.getListFields();

      const listData = {
        ...activeList,
        listConfig,
        listFields,
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
    <div id="list-designer" className="list-designer" style={{ height }}>
      <div className="list-designer-left">
        <div className="containers-wrapper selected">
          <ListFieldEditor ref={listFieldEditorRef} value={activeList.listFields} />
        </div>
      </div>
      <div className="form-designer-right">
        <ConfigPanel ref={listConfigRef} config={activeList.listConfig} />
      </div>
    </div>
  );
};

export default React.forwardRef(ListDesigner);
