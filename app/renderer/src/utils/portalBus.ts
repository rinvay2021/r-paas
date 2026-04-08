/**
 * renderer → portal 通信工具
 * wujie 环境下通过 bus emit
 */

function emit(event: string, payload?: any) {
  try {
    const wujie = (window as any).__WUJIE;
    if (wujie?.bus) {
      wujie.bus.$emit(event, payload);
      return;
    }
  } catch {}
}

export const portalBus = {
  openFormModal(params: { appCode: string; metaObjectCode: string; formCode: string; recordId?: string }) {
    emit('renderer:openFormModal', params);
  },
  overlayNavigate(url: string) {
    emit('renderer:overlayNavigate', url);
  },
  pushDrawer(item: { url: string; title?: string }) {
    emit('renderer:pushDrawer', item);
  },
  openNewPage(url: string) {
    emit('renderer:openNewPage', url);
  },
  /** 关闭表单弹窗，submitted=true 表示提交成功（需要刷新列表） */
  closeFormModal(submitted?: boolean) {
    emit('renderer:closeFormModal', submitted);
  },
  /** 刷新列表 - 只在 renderer 内部调用（非跨实例） */
  notifyListRefresh() {
    const fn = (window as any).__notifyListRefresh;
    if (typeof fn === 'function') fn();
  },
};
