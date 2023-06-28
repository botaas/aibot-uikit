import React, { useCallback, useEffect, useState } from 'react';

import { ChannelPreviewMessenger } from './ChannelPreviewMessenger';
import { useIsChannelMuted } from './hooks/useIsChannelMuted';
import { useChannelPreviewInfo } from './hooks/useChannelPreviewInfo';
import { getLatestMessagePreview } from './utils';

import { ChatContextValue, useChatContext } from '../../context/ChatContext';
import { useTranslationContext } from '../../context/TranslationContext';

import type { AvatarProps } from '../Avatar/Avatar';

import type { OneChatMessage } from '../../context/ChannelStateContext';

import type { Channel, DefaultOneChatGenerics, Event } from '../../types';

export type ChannelPreviewUIComponentProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = ChannelPreviewProps<OneChatGenerics> & {
  /** If the component's channel is the active (selected) Channel */
  active?: boolean;
  /** Image of Channel to display */
  displayImage?: string;
  /** Title of Channel to display */
  displayTitle?: string;
  /** The last message received in a channel */
  lastMessage?: OneChatMessage<OneChatGenerics>;
  /** Latest message preview to display, will be a string or JSX element supporting markdown. */
  latestMessage?: string | JSX.Element;
  /** Number of unread Messages */
  unread?: number;
};

export type ChannelPreviewProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  /** Comes from either the `channelRenderFilterFn` or `usePaginatedChannels` call from [ChannelList](https://github.com/botaas/aibot-uikit/blob/master/src/components/ChannelList/ChannelList.tsx) */
  channel: Channel<OneChatGenerics>;
  /** Current selected channel object */
  activeChannel?: Channel<OneChatGenerics>;
  /** Custom UI component to display user avatar, defaults to and accepts same props as: [Avatar](https://github.com/botaas/aibot-uikit/blob/master/src/components/Avatar/Avatar.tsx) */
  Avatar?: React.ComponentType<AvatarProps>;
  /** Forces the update of preview component on channel update */
  channelUpdateCount?: number;
  /** Custom class for the channel preview root */
  className?: string;
  key?: string;
  /** Custom ChannelPreview click handler function */
  onSelect?: (event: React.MouseEvent) => void;
  /** Custom UI component to display the channel preview in the list, defaults to and accepts same props as: [ChannelPreviewMessenger](https://github.com/botaas/aibot-uikit/blob/master/src/components/ChannelPreview/ChannelPreviewMessenger.tsx) */
  Preview?: React.ComponentType<ChannelPreviewUIComponentProps<OneChatGenerics>>;
  /** Setter for selected Channel */
  setActiveChannel?: ChatContextValue<OneChatGenerics>['setActiveChannel'];
  /** Object containing watcher parameters */
  watchers?: { limit?: number; offset?: number };
};

export const ChannelPreview = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: ChannelPreviewProps<OneChatGenerics>,
) => {
  const { channel, Preview = ChannelPreviewMessenger, channelUpdateCount } = props;
  const { channel: activeChannel, client, setActiveChannel } = useChatContext<OneChatGenerics>(
    'ChannelPreview',
  );
  const { t, userLanguage } = useTranslationContext('ChannelPreview');
  const { displayImage, displayTitle } = useChannelPreviewInfo({ channel });

  const [lastMessage, setLastMessage] = useState<OneChatMessage<OneChatGenerics>>(
    channel.state.messages[channel.state.messages.length - 1],
  );
  const [unread, setUnread] = useState(0);

  const isActive = activeChannel?.cid === channel.cid;
  const { muted } = useIsChannelMuted(channel);

  useEffect(() => {
    const handleEvent = (event: Event) => {
      if (!event.cid) return setUnread(0);
      if (channel.cid === event.cid) setUnread(0);
    };

    client.on('notification.mark_read', handleEvent);
    return () => client.off('notification.mark_read', handleEvent);
  }, []);

  const refreshUnreadCount = useCallback(() => {
    if (isActive || muted) {
      setUnread(0);
    } else {
      setUnread(channel.countUnread());
    }
  }, [channel, isActive, muted]);

  useEffect(() => {
    refreshUnreadCount();

    const handleEvent = (event: Event<OneChatGenerics>) => {
      if (event.message) setLastMessage(event.message);
      refreshUnreadCount();
    };

    channel.on('message.new', handleEvent);
    channel.on('message.updated', handleEvent);
    channel.on('message.deleted', handleEvent);

    return () => {
      channel.off('message.new', handleEvent);
      channel.off('message.updated', handleEvent);
      channel.off('message.deleted', handleEvent);
    };
  }, [refreshUnreadCount, channelUpdateCount]);

  if (!Preview) return null;

  const latestMessage = getLatestMessagePreview(channel, t, userLanguage);

  return (
    <Preview
      {...props}
      active={isActive}
      displayImage={displayImage}
      displayTitle={displayTitle}
      lastMessage={lastMessage}
      latestMessage={latestMessage}
      setActiveChannel={setActiveChannel}
      unread={unread}
    />
  );
};
