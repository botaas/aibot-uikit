import { useEffect } from 'react';
import uniqBy from 'lodash.uniqby';

import { moveChannelUp } from '../utils';

import { useChatContext } from '../../../context/ChatContext';

import type { Channel, Event, DefaultOneChatGenerics } from '../../../types';

export const useMessageNewListener = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  setChannels: React.Dispatch<React.SetStateAction<Array<Channel<OneChatGenerics>>>>,
  lockChannelOrder = false,
  allowNewMessagesFromUnfilteredChannels = true,
) => {
  const { client } = useChatContext<OneChatGenerics>('useMessageNewListener');

  useEffect(() => {
    const handleEvent = (event: Event<OneChatGenerics>) => {
      setChannels((channels) => {
        const channelInList = channels.filter((channel) => channel.cid === event.cid).length > 0;

        if (!channelInList && allowNewMessagesFromUnfilteredChannels && event.channel_type) {
          const channel = client.channel(event.channel_type, event.channel_id);
          return uniqBy([channel, ...channels], 'cid');
        }

        if (!lockChannelOrder) return moveChannelUp({ channels, cid: event.cid || '' });

        return channels;
      });
    };

    client.on('message.new', handleEvent);

    return () => {
      client.off('message.new', handleEvent);
    };
  }, [lockChannelOrder]);
};
