import { useEffect } from 'react';
import uniqBy from 'lodash.uniqby';

import { getChannel } from '../utils';

import { useChatContext } from '../../../context/ChatContext';

import type { Channel, DefaultOneChatGenerics, Event } from '../../../types';

export const useNotificationMessageNewListener = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  setChannels: React.Dispatch<React.SetStateAction<Array<Channel<OneChatGenerics>>>>,
  customHandler?: (
    setChannels: React.Dispatch<React.SetStateAction<Array<Channel<OneChatGenerics>>>>,
    event: Event<OneChatGenerics>,
  ) => void,
  allowNewMessagesFromUnfilteredChannels = true,
) => {
  const { client } = useChatContext<OneChatGenerics>('useNotificationMessageNewListener');

  useEffect(() => {
    const handleEvent = async (event: Event<OneChatGenerics>) => {
      if (customHandler && typeof customHandler === 'function') {
        customHandler(setChannels, event);
      } else if (allowNewMessagesFromUnfilteredChannels && event.channel?.type) {
        const channel = await getChannel(client, event.channel.type, event.channel.id);
        setChannels((channels) => uniqBy([channel, ...channels], 'cid'));
      }
    };

    client.on('notification.message_new', handleEvent);

    return () => {
      client.off('notification.message_new', handleEvent);
    };
  }, [customHandler]);
};
