import { RetrySendMessage, useChannelActionContext } from '../../../context/ChannelActionContext';

import type { DefaultOneChatGenerics } from '../../../types';

export const useRetryHandler = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  customRetrySendMessage?: RetrySendMessage<OneChatGenerics>,
): RetrySendMessage<OneChatGenerics> => {
  const { retrySendMessage: contextRetrySendMessage } = useChannelActionContext<OneChatGenerics>(
    'useRetryHandler',
  );

  const retrySendMessage = customRetrySendMessage || contextRetrySendMessage;

  return async (message) => {
    if (message) {
      await retrySendMessage(message);
    }
  };
};
