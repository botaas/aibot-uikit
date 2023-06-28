import { useEffect, useMemo, useState } from 'react';

import { MAX_QUERY_CHANNELS_LIMIT } from '../utils';

import { useChatContext } from '../../../context/ChatContext';

import type {
  Channel,
  ChannelFilters,
  ChannelOptions,
  ChannelSort,
  Client,
  DefaultOneChatGenerics,
} from '../../../types';

export const usePaginatedChannels = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  client: Client<OneChatGenerics>,
  filters: ChannelFilters<OneChatGenerics>,
  sort: ChannelSort<OneChatGenerics>,
  options: ChannelOptions,
  activeChannelHandler: (
    channels: Array<Channel<OneChatGenerics>>,
    setChannels: React.Dispatch<React.SetStateAction<Array<Channel<OneChatGenerics>>>>,
  ) => void,
) => {
  const {
    channelsQueryState: { setError, setQueryInProgress },
  } = useChatContext('usePaginatedChannels');
  const [channels, setChannels] = useState<Array<Channel<OneChatGenerics>>>([]);
  const [hasNextPage, setHasNextPage] = useState(true);

  // memoize props
  const filterString = useMemo(() => JSON.stringify(filters), [filters]);
  const sortString = useMemo(() => JSON.stringify(sort), [sort]);

  const queryChannels = async (queryType?: string) => {
    setError(null);

    if (queryType === 'reload') {
      setChannels([]);
      setQueryInProgress('reload');
    } else {
      setQueryInProgress('load-more');
    }

    const offset = queryType === 'reload' ? 0 : channels.length;

    const newOptions = {
      limit: options?.limit ?? MAX_QUERY_CHANNELS_LIMIT,
      offset,
      ...options,
    };

    try {
      const channelQueryResponse = await client.queryChannels(filters, sort || {}, newOptions);

      const newChannels =
        queryType === 'reload' ? channelQueryResponse : [...channels, ...channelQueryResponse];

      setChannels(newChannels);
      setHasNextPage(channelQueryResponse.length >= newOptions.limit);

      // Set active channel only on load of first page
      if (!offset && activeChannelHandler) {
        activeChannelHandler(newChannels, setChannels);
      }
    } catch (err) {
      console.warn(err);
      setError(err as Error);
    }

    setQueryInProgress(null);
  };

  const loadNextPage = () => {
    queryChannels();
  };

  useEffect(() => {
    queryChannels('reload');
  }, [filterString, sortString]);

  return {
    channels,
    hasNextPage,
    loadNextPage,
    setChannels,
  };
};
