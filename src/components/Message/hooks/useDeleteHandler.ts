import { validateAndGetMessage } from '../utils';

import { useChannelActionContext } from '../../../context/ChannelActionContext';
import { useChatContext } from '../../../context/ChatContext';
import { useTranslationContext } from '../../../context/TranslationContext';

import type { ReactEventHandler } from '../types';

import type { OneChatMessage } from '../../../context/ChannelStateContext';

import type { DefaultOneChatGenerics } from '../../../types';

export type DeleteMessageNotifications<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  getErrorNotification?: (message: OneChatMessage<OneChatGenerics>) => string;
  notify?: (notificationText: string, type: 'success' | 'error') => void;
};

export const useDeleteHandler = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  message?: OneChatMessage<OneChatGenerics>,
  notifications: DeleteMessageNotifications<OneChatGenerics> = {},
): ReactEventHandler => {
  const { getErrorNotification, notify } = notifications;

  const { updateMessage } = useChannelActionContext<OneChatGenerics>('useDeleteHandler');
  const { client } = useChatContext<OneChatGenerics>('useDeleteHandler');
  const { t } = useTranslationContext('useDeleteHandler');

  return async (event) => {
    event.preventDefault();
    if (!message?.id || !client || !updateMessage) {
      return;
    }

    try {
      const data = await client.deleteMessage(message.id);
      updateMessage(data.message);
    } catch (e) {
      const errorMessage =
        getErrorNotification && validateAndGetMessage(getErrorNotification, [message]);

      if (notify) notify(errorMessage || t('Error deleting message'), 'error');
    }
  };
};
