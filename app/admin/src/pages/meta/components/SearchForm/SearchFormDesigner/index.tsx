import React from 'react';
import { useRequest } from 'ahooks';
import { message } from 'antd';
import { metaService } from '@/api/meta';

import ConfigPanel from './components/ConfigPanel';
import SearchFormFieldEditor from './components/SearchFormFieldEditor';
import type {
  SearchFormDesignerRef,
  SearchFormDesignerProps,
  SearchFormConfigRef,
  SearchFormFieldEditorRef,
} from './types';

import './index.less';

const SearchFormDesigner: React.ForwardRefRenderFunction<
  SearchFormDesignerRef,
  SearchFormDesignerProps
> = (props, ref) => {
  const { refresh, height, activeSearchForm } = props;

  const searchFormConfigRef = React.useRef<SearchFormConfigRef>(null);
  const searchFormFieldEditorRef = React.useRef<SearchFormFieldEditorRef>(null);

  const { run: saveSearchForm } = useRequest(
    async () => {
      const searchFormConfig = searchFormConfigRef.current?.getSearchFormConfig();
      const searchFormFields = searchFormFieldEditorRef.current?.getSearchFormFields();

      const searchFormData = {
        ...activeSearchForm,
        searchFormConfig,
        searchFormFields,
      };

      return metaService.updateSearchForm(searchFormData);
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
    saveSearchForm,
  }));

  return (
    <div id="search-form-designer" className="search-form-designer" style={{ height }}>
      <div className="search-form-designer-left">
        <div className="containers-wrapper selected">
          <SearchFormFieldEditor
            ref={searchFormFieldEditorRef}
            value={activeSearchForm.searchFormFields}
          />
        </div>
      </div>
      <div className="search-form-designer-right">
        <ConfigPanel ref={searchFormConfigRef} config={activeSearchForm.searchFormConfig} />
      </div>
    </div>
  );
};

export default React.forwardRef(SearchFormDesigner);
