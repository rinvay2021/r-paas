import React from 'react';
import {
  Modal, Upload, Button, Radio, Space, Typography, message,
  Tooltip, Steps, Tag, Divider,
} from 'antd';
import {
  InboxOutlined, DownloadOutlined, CheckCircleOutlined,
  FileExcelOutlined, SettingOutlined,
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import type { ListData } from '@/api/renderer/interface';
import { dataApi } from '@/api/data';

const { Dragger } = Upload;
const { Text, Title } = Typography;

type ConflictStrategy = 'skip' | 'upsert' | 'insert';

interface ImportModalProps {
  open: boolean;
  listData: ListData;
  onClose: () => void;
  onSuccess: () => void;
  onAsyncTask: (taskId: string) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ROWS = 5000;
const ROW_HEIGHT = 32;

// ── 可编辑表格（虚拟滚动）────────────────────────────────
interface EditableGridProps {
  headers: string[];
  rows: Record<string, any>[];
  onChange: (rows: Record<string, any>[]) => void;
}

const EditableGrid: React.FC<EditableGridProps> = ({ headers, rows, onChange }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [containerHeight, setContainerHeight] = React.useState(400);
  const [editCell, setEditCell] = React.useState<{ row: number; col: string } | null>(null);
  const [editVal, setEditVal] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // 动态计算容器高度
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setContainerHeight(el.clientHeight));
    obs.observe(el);
    setContainerHeight(el.clientHeight);
    return () => obs.disconnect();
  }, []);

  const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT) + 2;
  const startIdx = Math.floor(scrollTop / ROW_HEIGHT);
  const endIdx = Math.min(startIdx + visibleCount, rows.length);
  const visibleRows = rows.slice(startIdx, endIdx);
  const paddingTop = startIdx * ROW_HEIGHT;
  const totalHeight = rows.length * ROW_HEIGHT;

  const COL_WIDTH = 140;
  const IDX_WIDTH = 48;

  const startEdit = (ri: number, col: string) => {
    setEditCell({ row: ri, col });
    setEditVal(String(rows[ri][col] ?? ''));
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commitEdit = () => {
    if (!editCell) return;
    const next = [...rows];
    next[editCell.row] = { ...next[editCell.row], [editCell.col]: editVal };
    onChange(next);
    setEditCell(null);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); commitEdit(); }
    if (e.key === 'Escape') setEditCell(null);
  };

  const cellBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center',
    width: COL_WIDTH, minWidth: COL_WIDTH, maxWidth: COL_WIDTH,
    height: ROW_HEIGHT, borderRight: '1px solid #f0f0f0',
    boxSizing: 'border-box', flexShrink: 0, overflow: 'hidden',
  };

  return (
    <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden', height: '100%' }}>
      {/* 唯一滚动容器：横向 + 纵向同时滚动，表头 sticky 跟随 */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', overflow: 'auto' }}
        onScroll={e => setScrollTop((e.currentTarget as HTMLDivElement).scrollTop)}
      >
        <div style={{ minWidth: IDX_WIDTH + headers.length * COL_WIDTH }}>
          {/* 表头：sticky top，随横向滚动，不随纵向滚动 */}
          <div style={{ position: 'sticky', top: 0, zIndex: 2, display: 'flex', background: '#f5f5f5', borderBottom: '2px solid #e0e0e0', fontWeight: 600, fontSize: 12 }}>
            <div style={{ ...cellBase, width: IDX_WIDTH, minWidth: IDX_WIDTH, maxWidth: IDX_WIDTH, justifyContent: 'center', color: '#999', background: '#f5f5f5' }}>#</div>
            {headers.map(h => (
              <div key={h} style={{ ...cellBase, padding: '0 8px', color: '#333' }} title={h}>{h}</div>
            ))}
          </div>

          {/* 数据区：虚拟滚动 */}
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div style={{ position: 'absolute', top: paddingTop, left: 0, right: 0 }}>
            {visibleRows.map((row, vi) => {
              const ri = startIdx + vi;
              return (
                <div key={ri} style={{ display: 'flex', borderBottom: '1px solid #f5f5f5', background: ri % 2 === 0 ? '#fff' : '#fafcff' }}>
                  <div style={{ ...cellBase, width: IDX_WIDTH, minWidth: IDX_WIDTH, maxWidth: IDX_WIDTH, justifyContent: 'center', color: '#bbb', fontSize: 11, background: ri % 2 === 0 ? '#fafafa' : '#f5f8ff' }}>
                    {ri + 1}
                  </div>
                  {headers.map(col => {
                    const isEditing = editCell?.row === ri && editCell?.col === col;
                    return (
                      <div
                        key={col}
                        style={{
                          ...cellBase,
                          cursor: 'text',
                          padding: isEditing ? 0 : '0 8px',
                          outline: isEditing ? '2px solid #1677ff' : undefined,
                          outlineOffset: '-2px',
                        }}
                        onDoubleClick={() => startEdit(ri, col)}
                      >
                        {isEditing ? (
                          <input
                            ref={inputRef}
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={onKeyDown}
                            style={{ width: '100%', height: '100%', border: 'none', outline: 'none', padding: '0 8px', fontSize: 13, background: 'transparent', boxSizing: 'border-box' }}
                          />
                        ) : (
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
                            {String(row[col] ?? '')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

// ── 主组件 ────────────────────────────────────────────────
const STRATEGY_OPTIONS: { value: ConflictStrategy; label: string; desc: string }[] = [
  { value: 'insert', label: '全量插入', desc: '直接新增所有行，不检测重复' },
  { value: 'skip',   label: '跳过重复', desc: '按唯一键匹配，已存在则跳过' },
  { value: 'upsert', label: '覆盖更新', desc: '按唯一键匹配，已存在则更新' },
];

const ImportModal: React.FC<ImportModalProps> = ({ open, listData, onClose }) => {
  const [step, setStep] = React.useState(0);
  const [file, setFile] = React.useState<File | null>(null);
  const [rows, setRows] = React.useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [conflictStrategy, setConflictStrategy] = React.useState<ConflictStrategy>('insert');
  const [submitting, setSubmitting] = React.useState(false);

  const { appCode, metaObjectCode } = listData;
  const listCode = (listData as any).listCode || '';
  const hasUniqueKey = ((listData as any).listFields || []).some((f: any) => f.isUniqueKey === true);

  const reset = () => {
    setStep(0); setFile(null); setRows([]); setHeaders([]); setConflictStrategy('insert');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleDownloadTemplate = async () => {
    try {
      const res = await dataApi.downloadTemplate({ appCode, metaObjectCode, listCode });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${metaObjectCode}_template.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // 拦截器统一处理
    }
  };

  const handleFileUpload = async (uploadFile: File) => {
    if (!uploadFile.name.match(/\.(xlsx|xls)$/i)) { message.error('仅支持 .xlsx / .xls 格式'); return false; }
    if (uploadFile.size > MAX_FILE_SIZE) { message.error('文件大小不能超过 10MB'); return false; }

    const buffer = await uploadFile.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (rawData.length < 2) { message.error('文件内容为空'); return false; }

    const headerRow = (rawData[0] as string[]).map(h => String(h).replace(/^\*/, ''));
    const dataRows = rawData.slice(2);
    if (dataRows.length > MAX_ROWS) { message.error(`数据行数不能超过 ${MAX_ROWS} 行`); return false; }

    const parsed = dataRows
      .map((row: any[]) => Object.fromEntries(headerRow.map((h, ci) => [h, row[ci] ?? ''])))
      .filter(r => headerRow.some(h => r[h] !== ''));

    setFile(uploadFile);
    setHeaders(headerRow);
    setRows(parsed);
    setStep(1);
    return false;
  };

  const handleSubmit = async () => {
    if (!file) return;

    const wb = XLSX.utils.book_new();
    const emptyRow = headers.map(() => '');
    const ws = XLSX.utils.aoa_to_sheet([headers, emptyRow, ...rows.map(r => headers.map(h => r[h] ?? ''))]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const editedFile = new File([buf], file.name, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', editedFile);
      formData.append('appCode', appCode);
      formData.append('metaObjectCode', metaObjectCode);
      formData.append('listCode', listCode);
      formData.append('conflictStrategy', conflictStrategy);

      const res = await dataApi.importData(formData);
      if (res.data?.taskId) {
        message.success('导入任务已创建，请前往任务列表查看进度');
        handleClose();
      }
    } catch(e) {
      console.log(e,'errpr')
      // 拦截器统一处理
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 0：引导下载 + 上传 ──────────────────────────────
  const renderStep0 = () => (
    <div style={{ display: 'flex', gap: 24, height: '100%' }}>
      {/* 左：步骤引导 */}
      <div style={{ width: 220, flexShrink: 0, background: '#f8f9fa', borderRadius: 8, padding: '20px 16px' }}>
        <Title level={5} style={{ marginBottom: 20, color: '#333' }}>导入步骤</Title>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { icon: <DownloadOutlined style={{ color: '#1677ff' }} />, title: '下载模板', desc: '获取标准导入模板，按格式填写数据' },
            { icon: <FileExcelOutlined style={{ color: '#52c41a' }} />, title: '填写数据', desc: '按模板格式填写，勿修改表头' },
            { icon: <InboxOutlined style={{ color: '#fa8c16' }} />, title: '上传文件', desc: '上传填写好的 Excel 文件' },
            { icon: <SettingOutlined style={{ color: '#722ed1' }} />, title: '选择策略', desc: '确认冲突处理方式后提交' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', border: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#333', lineHeight: '20px' }}>{s.title}</div>
                <div style={{ fontSize: 12, color: '#999', lineHeight: '18px' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 右：操作区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '14px 16px', border: '1px solid #d6e8ff' }}>
          <div style={{ fontSize: 13, color: '#333', marginBottom: 8, fontWeight: 500 }}>第一步：下载导入模板</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
            模板包含所有可导入字段，请勿修改表头，第 2 行为示例数据可删除。
          </div>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate} type="primary" ghost>
            下载 {metaObjectCode} 导入模板
          </Button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 13, color: '#333', marginBottom: 8, fontWeight: 500 }}>第二步：上传填写好的文件</div>
          <Dragger
            accept=".xlsx,.xls"
            beforeUpload={handleFileUpload}
            showUploadList={false}
            multiple={false}
            style={{ flex: 1 }}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
            <p className="ant-upload-hint">支持 .xlsx / .xls 格式，最大 10MB，最多 {MAX_ROWS.toLocaleString()} 行数据</p>
          </Dragger>
        </div>
      </div>
    </div>
  );

  // ── Step 1：预览 + 冲突策略 ──────────────────────────────
  const renderStep1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      {/* 顶部信息栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
        <Text>已解析 <Text strong>{rows.length}</Text> 行数据，共 <Text strong>{headers.length}</Text> 列</Text>
        <Tag color="blue">{file?.name}</Tag>
        <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>双击单元格可编辑</Text>
      </div>

      {/* 主体：表格 + 冲突策略并排 */}
      <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0 }}>
        {/* 表格 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <EditableGrid headers={headers} rows={rows} onChange={setRows} />
        </div>

        {/* 冲突策略侧边栏 */}
        <div style={{ width: 220, flexShrink: 0, background: '#fafafa', borderRadius: 8, padding: '16px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>冲突处理策略</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            当导入数据与已有记录冲突时的处理方式
          </Text>
          <Divider style={{ margin: '0' }} />
          <Radio.Group
            value={conflictStrategy}
            onChange={e => setConflictStrategy(e.target.value)}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {STRATEGY_OPTIONS.map(opt => (
              <Tooltip
                key={opt.value}
                title={opt.value !== 'insert' && !hasUniqueKey ? '需在列表设计器中为字段勾选"唯一键"后才可使用' : ''}
                placement="left"
              >
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: `1px solid ${conflictStrategy === opt.value ? '#1677ff' : '#e8e8e8'}`,
                    background: conflictStrategy === opt.value ? '#e8f4ff' : '#fff',
                    cursor: opt.value !== 'insert' && !hasUniqueKey ? 'not-allowed' : 'pointer',
                    opacity: opt.value !== 'insert' && !hasUniqueKey ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                  onClick={() => {
                    if (opt.value !== 'insert' && !hasUniqueKey) return;
                    setConflictStrategy(opt.value);
                  }}
                >
                  <Radio value={opt.value} disabled={opt.value !== 'insert' && !hasUniqueKey} style={{ display: 'none' }} />
                  <div style={{ fontSize: 13, fontWeight: 500, color: conflictStrategy === opt.value ? '#1677ff' : '#333', marginBottom: 2 }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#999' }}>{opt.desc}</div>
                </div>
              </Tooltip>
            ))}
          </Radio.Group>

          {!hasUniqueKey && (
            <div style={{ fontSize: 11, color: '#fa8c16', background: '#fff7e6', borderRadius: 4, padding: '6px 8px', border: '1px solid #ffd591' }}>
              未配置唯一键，仅可使用全量插入
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const footerButtons = step === 0
    ? [<Button key="cancel" onClick={handleClose}>取消</Button>]
    : [
        <Button key="back" onClick={() => setStep(0)}>上一步</Button>,
        <Button key="submit" type="primary" loading={submitting} onClick={handleSubmit}>确认导入</Button>,
      ];

  return (
    <Modal
      title="导入数据"
      open={open}
      onCancel={handleClose}
      width="80vw"
      style={{ top: '5vh' }}
      styles={{ body: { height: '70vh', padding: '16px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' } }}
      destroyOnClose
      footer={footerButtons}
    >
      <Steps
        current={step}
        size="small"
        style={{ marginBottom: 16, flexShrink: 0 }}
        items={[{ title: '准备文件' }, { title: '预览 & 导入' }]}
      />
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {step === 0 ? renderStep0() : renderStep1()}
      </div>
    </Modal>
  );
};

export default ImportModal;
