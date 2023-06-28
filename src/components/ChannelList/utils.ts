import uniqBy from 'lodash.uniqby';

import type { Channel, Client, DefaultOneChatGenerics, QueryChannelAPIResponse } from '../../types';

/**
 * prevent from duplicate invocation of channel.watch()
 * when events 'notification.message_new' and 'notification.added_to_channel' arrive at the same time
 */
const WATCH_QUERY_IN_PROGRESS_FOR_CHANNEL: Record<
  string,
  Promise<QueryChannelAPIResponse> | undefined
> = {};

/**
 * Calls channel.watch() if it was not already recently called. Waits for watch promise to resolve even if it was invoked previously.
 * @param client
 * @param type
 * @param id
 */
export const getChannel = async <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  client: Client<OneChatGenerics>,
  type: string,
  id: string,
) => {
  const channel = client.channel(type, id);
  const queryPromise = WATCH_QUERY_IN_PROGRESS_FOR_CHANNEL[channel.cid];
  if (queryPromise) {
    await queryPromise;
  } else {
    WATCH_QUERY_IN_PROGRESS_FOR_CHANNEL[channel.cid] = channel.watch();
    await WATCH_QUERY_IN_PROGRESS_FOR_CHANNEL[channel.cid];
    WATCH_QUERY_IN_PROGRESS_FOR_CHANNEL[channel.cid] = undefined;
  }

  return channel;
};

export const MAX_QUERY_CHANNELS_LIMIT = 30;

type MoveChannelUpParams<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  channels: Array<Channel<OneChatGenerics>>;
  cid: string;
  activeChannel?: Channel<OneChatGenerics>;
};

export const moveChannelUp = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>({
  activeChannel,
  channels,
  cid,
}: MoveChannelUpParams<OneChatGenerics>) => {
  // get index of channel to move up
  const channelIndex = channels.findIndex((channel) => channel.cid === cid);

  if (!activeChannel && channelIndex <= 0) return channels;

  // get channel to move up
  const channel = activeChannel || channels[channelIndex];

  return uniqBy([channel, ...channels], 'cid');
};
