import { useEffect } from 'react';

import { useChatContext } from '../../../context/ChatContext';

import type { Channel, Event, DefaultOneChatGenerics } from '../../../types';

export const useChannelDeletedListener = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  setChannels: React.Dispatch<React.SetStateAction<Array<Channel<OneChatGenerics>>>>,
  customHandler?: (
    setChannels: React.Dispatch<React.SetStateAction<Array<Channel<OneChatGenerics>>>>,
    event: Event<OneChatGenerics>,
  ) => void,
) => {
  const { client } = useChatContext<OneChatGenerics>('useChannelDeletedListener');

  useEffect(() => {
    const handleEvent = (event: Event<OneChatGenerics>) => {
      if (customHandler && typeof customHandler === 'function') {
        customHandler(setChannels, event);
      } else {
        setChannels((channels) => {
          const channelIndex = channels.findIndex((channel) => channel.cid === event.cid);

          if (channelIndex < 0) return [...channels];

          // Remove the deleted channel from the list.s
          channels.splice(channelIndex, 1);

          return [...channels];
        });
      }
    };

    client.on('channel.deleted', handleEvent);

    return () => {
      client.off('channel.deleted', handleEvent);
    };
  }, [customHandler]);
};
