import { Modal, message as AntMessage, notification } from 'ant-design-vue';

/**
 * 统一消息与确认框（参考 limsUI）
 * - createMessage: 轻提示
 * - notification: 通知
 * - createConfirm: 确认框（可配 iconType）
 */
export function useMessage() {
  return {
    createMessage: AntMessage,
    notification,
    /** 确认框，iconType: warning | success | error | info */
    createConfirm: (options: {
      iconType?: 'warning' | 'success' | 'error' | 'info';
      title?: string;
      content?: string;
      okText?: string;
      cancelText?: string;
      onOk?: () => void | Promise<void>;
      onCancel?: () => void;
    }) => {
      const { iconType = 'warning', ...rest } = options;
      return Modal.confirm({
        centered: true,
        okText: rest.okText ?? '确定',
        cancelText: rest.cancelText ?? '取消',
        ...rest,
      });
    },
  };
}
