import { useChannelActionContext } from '../../../context/ChannelActionContext';
import { OneChatMessage, useChannelStateContext } from '../../../context/ChannelStateContext';

import type React from 'react';

import type { DefaultOneChatGenerics } from '../../../types';

export type FormData = Record<string, string>;

export type ActionHandlerReturnType = (
  dataOrName?: string | FormData,
  value?: string,
  event?: React.BaseSyntheticEvent,
) => Promise<void> | void;

export const handleActionWarning = `Action handler was called, but it is missing one of its required arguments. 
Make sure the ChannelAction and ChannelState contexts are properly set and the hook is initialized with a valid message.`;

export function useActionHandler<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(message?: OneChatMessage<OneChatGenerics>): ActionHandlerReturnType {
  const { removeMessage, updateMessage } = useChannelActionContext<OneChatGenerics>(
    'useActionHandler',
  );
  const { channel } = useChannelStateContext<OneChatGenerics>('useActionHandler');

  return async (dataOrName, value, event) => {
    if (event) event.preventDefault();

    if (!message || !updateMessage || !removeMessage || !channel) {
      console.warn(handleActionWarning);
      return;
    }

    const messageID = message.id;
    let formData: FormData = {};

    // deprecated: value&name should be removed in favor of data obj
    if (typeof dataOrName === 'string') {
      formData[dataOrName] = value as string;
    } else {
      formData = { ...dataOrName };
    }

    if (messageID) {
      const data = await channel.sendAction(messageID, formData);

      if (data?.message) {
        updateMessage(data.message);
      } else {
        removeMessage(message);
      }
    }
  };
}
