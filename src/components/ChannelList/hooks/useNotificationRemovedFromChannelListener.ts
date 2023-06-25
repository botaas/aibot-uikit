import { useEffect } from 'react';

import { useChatContext } from '../../../context/ChatContext';

import type { Channel, Event, DefaultOneChatGenerics } from '../../../types';

export const useNotificationRemovedFromChannelListener = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  setChannels: React.Dispatch<React.SetStateAction<Array<Channel<OneChatGenerics>>>>,
  customHandler?: (
    setChannels: React.Dispatch<React.SetStateAction<Array<Channel<OneChatGenerics>>>>,
    event: Event<OneChatGenerics>,
  ) => void,
) => {
  const { client } = useChatContext<OneChatGenerics>(
    'useNotificationRemovedFromChannelListener',
  );

  useEffect(() => {
    const handleEvent = (event: Event<OneChatGenerics>) => {
      if (customHandler && typeof customHandler === 'function') {
        customHandler(setChannels, event);
      } else {
        setChannels((channels) => channels.filter((channel) => channel.cid !== event.channel?.cid));
      }
    };

    client.on('notification.removed_from_channel', handleEvent);

    return () => {
      client.off('notification.removed_from_channel', handleEvent);
    };
  }, [customHandler]);
};
