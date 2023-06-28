import { useEffect } from 'react';

import { useChatContext } from '../../../context/ChatContext';

import type { Channel, DefaultOneChatGenerics, Event } from '../../../types';

export const useChannelUpdatedListener = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  setChannels: React.Dispatch<React.SetStateAction<Array<Channel<OneChatGenerics>>>>,
  customHandler?: (
    setChannels: React.Dispatch<React.SetStateAction<Array<Channel<OneChatGenerics>>>>,
    event: Event<OneChatGenerics>,
  ) => void,
  forceUpdate?: () => void,
) => {
  const { client } = useChatContext<OneChatGenerics>('useChannelUpdatedListener');

  useEffect(() => {
    const handleEvent = (event: Event<OneChatGenerics>) => {
      setChannels((channels) => {
        const channelIndex = channels.findIndex((channel) => channel.cid === event.channel?.cid);

        if (channelIndex > -1 && event.channel) {
          const newChannels = channels;
          newChannels[channelIndex].data = {
            ...event.channel,
            hidden: event.channel?.hidden ?? newChannels[channelIndex].data?.hidden,
            own_capabilities:
              event.channel?.own_capabilities ?? newChannels[channelIndex].data?.own_capabilities,
          };

          return [...newChannels];
        }

        return channels;
      });
      if (forceUpdate) {
        forceUpdate();
      }
      if (customHandler && typeof customHandler === 'function') {
        customHandler(setChannels, event);
      }
    };

    client.on('channel.updated', handleEvent);

    return () => {
      client.off('channel.updated', handleEvent);
    };
  }, [customHandler]);
};
