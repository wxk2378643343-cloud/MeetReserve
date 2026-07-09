import { message as antMessage } from 'antd';

export const message = {
  success: (content: string) => antMessage.success(content),
  error: (content: string) => antMessage.error(content),
  warning: (content: string) => antMessage.warning(content),
  info: (content: string) => antMessage.info(content),
};
