import { useEffect, useState } from 'react';

import { useChatContext } from '../../../context/ChatContext';

import type { Channel, DefaultOneChatGenerics } from '../../../types';

export const useIsChannelMuted = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  channel: Channel<OneChatGenerics>,
) => {
  const { client } = useChatContext<OneChatGenerics>('useIsChannelMuted');

  const [muted, setMuted] = useState(channel.muteStatus());

  useEffect(() => {
    const handleEvent = () => setMuted(channel.muteStatus());

    client.on('notification.channel_mutes_updated', handleEvent);
    return () => client.off('notification.channel_mutes_updated', handleEvent);
  }, [muted]);

  return muted;
};
