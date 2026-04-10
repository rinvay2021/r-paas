import React from 'react';
import { Modal, Radio, Space, message, Spin } from 'antd';
import type { ListData } from '@/api/renderer/interface';
import { dataApi } from '@/api/data';

interface ExportModalProps {
  open: boolean;
  listData: ListData;
  selectedRows: Record<string, any>[];
  searchParams?: Array<{ fieldCode: string; condition: string; value: any }>;
  onClose: () => void;
  onAsyncTask: (taskId: string) => void;
}

// all = 全量（无搜索条件）, allWithSearch = 全量（带搜索条件）, selected = 选中行
type ExportScope = 'all' | 'allWithSearch' | 'selected';

const ExportModal: React.FC<ExportModalProps> = ({
  open, listData, selectedRows, searchParams,
  onClose, onAsyncTask,
}) => {
  const [scope, setScope] = React.useState<ExportScope>('all');
  const [loading, setLoading] = React.useState(false);

  const { appCode, metaObjectCode } = listData;
  const listCode = (listData as any).listCode || '';

  const handleOk = async () => {
    setLoading(true);
    try {
      const params = {
        appCode, metaObjectCode, listCode,
        scope: scope === 'allWithSearch' ? 'all' : scope,
        ids: scope === 'selected' ? selectedRows.map(r => r._id).filter(Boolean) : undefined,
        searchParams: scope === 'allWithSearch' ? searchParams : undefined,
      };

      // blob 透传：拦截器直接返回完整 axios response，data 字段是 Blob
      const res = await dataApi.exportData(params) as any;
      const blob: Blob = res.data;

      // 读前 2 字节判断是否是 ZIP/Excel（PK 魔数 0x50 0x4B）
      const header = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
      const isExcel = header[0] === 0x50 && header[1] === 0x4B;

      if (isExcel) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${metaObjectCode}_${Date.now()}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        message.success('导出成功');
        onClose();
      } else {
        // 异步任务：blob 内容是 JSON
        const json = JSON.parse(await blob.text());
        const taskId = json?.data?.taskId;
        if (taskId) {
          message.info('数据量较大，已创建导出任务，请在任务列表中查看');
          onAsyncTask(taskId);
          onClose();
        }
      }
    } catch {
      // 错误提示由 http 拦截器统一处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="导出数据"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="确认导出"
      cancelText="取消"
      confirmLoading={loading}
      width={400}
    >
      <Spin spinning={loading}>
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: 12, color: '#666' }}>请选择导出范围：</div>
          <Radio.Group value={scope} onChange={e => setScope(e.target.value)}>
            <Space direction="vertical">
              <Radio value="all">全量导出</Radio>
              <Radio value="allWithSearch" disabled={!searchParams?.length}>
                全量导出（带搜索条件）
              </Radio>
              <Radio value="selected" disabled={selectedRows.length === 0}>
                导出选中行（已选 {selectedRows.length} 条）
              </Radio>
            </Space>
          </Radio.Group>
        </div>
      </Spin>
    </Modal>
  );
};

export default ExportModal;
