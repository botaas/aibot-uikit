import { useEffect } from 'react';

import { useChatContext } from '../../../context/ChatContext';

import type { Channel, Event, DefaultOneChatGenerics } from '../../../types';

export const useChannelHiddenListener = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  setChannels: React.Dispatch<React.SetStateAction<Array<Channel<OneChatGenerics>>>>,
  customHandler?: (
    setChannels: React.Dispatch<React.SetStateAction<Array<Channel<OneChatGenerics>>>>,
    event: Event<OneChatGenerics>,
  ) => void,
) => {
  const { client } = useChatContext<OneChatGenerics>('useChannelHiddenListener');

  useEffect(() => {
    const handleEvent = (event: Event<OneChatGenerics>) => {
      if (customHandler && typeof customHandler === 'function') {
        customHandler(setChannels, event);
      } else {
        setChannels((channels) => {
          const channelIndex = channels.findIndex((channel) => channel.cid === event.cid);
          if (channelIndex < 0) return [...channels];

          // Remove the hidden channel from the list.s
          channels.splice(channelIndex, 1);

          return [...channels];
        });
      }
    };

    client.on('channel.hidden', handleEvent);

    return () => {
      client.off('channel.hidden', handleEvent);
    };
  }, [customHandler]);
};
