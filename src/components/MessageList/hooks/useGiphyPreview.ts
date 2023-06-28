import { useEffect, useState } from 'react';

import { useChatContext } from '../../../context/ChatContext';

import type { OneChatMessage } from '../../../context/ChannelStateContext';

import type { DefaultOneChatGenerics, EventHandler } from '../../../types';

export const useGiphyPreview = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  separateGiphyPreview: boolean,
) => {
  const [giphyPreviewMessage, setGiphyPreviewMessage] = useState<OneChatMessage<OneChatGenerics>>();

  const { client } = useChatContext<OneChatGenerics>('useGiphyPreview');

  useEffect(() => {
    const handleEvent: EventHandler<OneChatGenerics> = (event) => {
      const { message, user } = event;

      if (message?.command === 'giphy' && user?.id === client.userID) {
        setGiphyPreviewMessage(undefined);
      }
    };

    if (separateGiphyPreview) client.on('message.new', handleEvent);
    return () => client.off('message.new', handleEvent);
  }, [separateGiphyPreview]);

  return { giphyPreviewMessage, setGiphyPreviewMessage };
};
