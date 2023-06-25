import { useChannelActionContext } from '../../../context/ChannelActionContext';

import type { ReactEventHandler } from '../types';

import type { OneChatMessage } from '../../../context/ChannelStateContext';

import type { DefaultOneChatGenerics } from '../../../types';

export const useOpenThreadHandler = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  message?: OneChatMessage<OneChatGenerics>,
  customOpenThread?: (
    message: OneChatMessage<OneChatGenerics>,
    event: React.BaseSyntheticEvent,
  ) => void,
): ReactEventHandler => {
  const { openThread: channelOpenThread } = useChannelActionContext<OneChatGenerics>(
    'useOpenThreadHandler',
  );

  const openThread = customOpenThread || channelOpenThread;

  return (event) => {
    if (!openThread || !message) {
      console.warn('Open thread handler was called but it is missing one of its parameters');
      return;
    }

    openThread(message, event);
  };
};
