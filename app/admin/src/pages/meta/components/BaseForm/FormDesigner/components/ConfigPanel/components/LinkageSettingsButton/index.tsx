import React, { useState, useMemo } from 'react';
import { Button } from 'antd';
import { GatewayOutlined } from '@ant-design/icons';
import { flatten } from 'lodash';
import { useMetaFields } from '@/store/metaFields';
import { FieldTypeEnum } from '@/pages/meta/components/BaseField/type';
import type { LinkageSettings } from '../../../../types/linkage';
import type { ContainerType } from '@/api/meta/interface';
import LinkageModal from './LinkageModal';

interface LinkageSettingsButtonProps {
  value?: LinkageSettings;
  onChange?: (value: LinkageSettings) => void;
  containers?: ContainerType[];
}

// 不支持联动的字段类型
const UNSUPPORTED_FIELD_TYPES = [
  FieldTypeEnum.FileUpload,
  FieldTypeEnum.ImageUpload,
  FieldTypeEnum.Text_Rich,
];

const LinkageSettingsButton: React.FC<LinkageSettingsButtonProps> = ({
  value,
  onChange,
  containers = [],
}) => {
  const [open, setOpen] = useState(false);
  const allFields = useMetaFields();

  const handleOk = (newValue: LinkageSettings) => {
    onChange?.(newValue);
    setOpen(false);
  };

  // 获取表单中所有字段的 fieldCode
  const formFieldCodes = useMemo(() => {
    const fields = flatten(containers.map(c => c.fields || []));
    return new Set(fields.map(f => f.fieldCode).filter(Boolean));
  }, [containers]);

  // 过滤出表单中存在的字段，并排除不支持联动的字段类型
  const availableFields = useMemo(() => {
    return allFields
      .filter(field => {
        // 必须在表单中
        if (!formFieldCodes.has(field.fieldCode)) return false;
        // 过滤不支持联动的字段类型
        if (UNSUPPORTED_FIELD_TYPES.includes(field.fieldType)) return false;
        return true;
      })
      .map(field => ({
        fieldCode: field.fieldCode || '',
        fieldName: field.fieldName || '',
        fieldType: field.fieldType || '',
        datasourceCode: field.config?.datasourceCode,
      }));
  }, [allFields, formFieldCodes]);

  // 计算已配置规则数量
  const ruleCount = Array.isArray(value) ? value.length : 0;

  return (
    <>
      <Button icon={<GatewayOutlined />} type="text" onClick={() => setOpen(true)}>
        {ruleCount > 0 ? `已配置 ${ruleCount} 条规则` : '点击设置'}
      </Button>
      <LinkageModal
        open={open}
        value={value}
        fields={availableFields}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
      />
    </>
  );
};

export default LinkageSettingsButton;
