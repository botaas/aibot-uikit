import { useEffect } from 'react';

import { useChatContext } from '../../../context/ChatContext';

import type { DefaultOneChatGenerics } from '../../../types';

export const useConnectionRecoveredListener = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  forceUpdate?: () => void,
) => {
  const { client } = useChatContext<OneChatGenerics>('useConnectionRecoveredListener');

  useEffect(() => {
    const handleEvent = () => {
      if (forceUpdate) {
        forceUpdate();
      }
    };

    client.on('connection.recovered', handleEvent);

    return () => {
      client.off('connection.recovered', handleEvent);
    };
  }, []);
};
