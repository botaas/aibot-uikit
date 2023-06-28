import { useEffect } from 'react';
import uniqBy from 'lodash.uniqby';

import { getChannel } from '../utils';

import { useChatContext } from '../../../context/ChatContext';

import type { Channel, DefaultOneChatGenerics, Event } from '../../../types';

export const useChannelVisibleListener = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  setChannels: React.Dispatch<React.SetStateAction<Array<Channel<OneChatGenerics>>>>,
  customHandler?: (
    setChannels: React.Dispatch<React.SetStateAction<Array<Channel<OneChatGenerics>>>>,
    event: Event<OneChatGenerics>,
  ) => void,
) => {
  const { client } = useChatContext<OneChatGenerics>('useChannelVisibleListener');

  useEffect(() => {
    const handleEvent = async (event: Event<OneChatGenerics>) => {
      if (customHandler && typeof customHandler === 'function') {
        customHandler(setChannels, event);
      } else if (event.type && event.channel_type && event.channel_id) {
        const channel = await getChannel(client, event.channel_type, event.channel_id);
        setChannels((channels) => uniqBy([channel, ...channels], 'cid'));
      }
    };

    client.on('channel.visible', handleEvent);

    return () => {
      client.off('channel.visible', handleEvent);
    };
  }, [customHandler]);
};
