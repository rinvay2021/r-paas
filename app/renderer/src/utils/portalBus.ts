/**
 * renderer → portal 通信工具
 * wujie 环境下通过 bus emit
 */

function emit(event: string, payload?: any) {
  try {
    const wujie = (window as any).__WUJIE;
    if (wujie?.bus) {
      wujie.bus.$emit(event, payload);
    }
  } catch {}
}

function getWujieBus() {
  try {
    return (window as any).__WUJIE?.bus ?? null;
  } catch {
    return null;
  }
}

export const portalBus = {
  openFormModal(params: { appCode: string; metaObjectCode: string; formCode: string; recordId?: string; actionId?: string }) {
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
  closeFormModal(submitted?: boolean) {
    emit('renderer:closeFormModal', submitted);
  },
  openTaskList() {
    emit('renderer:openTaskList');
  },

  /** 监听 portal:formClosed，带 actionId */
  onFormClosed(handler: (payload: { actionId?: string }) => void) {
    const bus = getWujieBus();
    if (!bus) return () => {};
    bus.$on('portal:formClosed', handler);
    return () => bus.$off('portal:formClosed', handler);
  },
};
