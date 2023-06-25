import React, { PropsWithChildren, useContext } from 'react';

import type {
  DefaultOneChatGenerics,
  GiphyVersions,
  ImageAttachmentSizeHandler,
  UnknownType,
  VideoAttachmentSizeHandler,
  Channel,
  ChannelConfigWithInfo,
  MessageResponse,
  Mute,
  ChannelState as OneChatChannelState,
} from '../types';

export type ChannelNotifications = Array<{
  id: string;
  text: string;
  type: 'success' | 'error';
}>;

export type OneChatMessage<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> =
  | ReturnType<OneChatChannelState<OneChatGenerics>['formatMessage']>
  | MessageResponse<OneChatGenerics>;

export type ChannelState<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  suppressAutoscroll: boolean;
  error?: Error | null;
  hasMore?: boolean;
  hasMoreNewer?: boolean;
  highlightedMessageId?: string;
  loading?: boolean;
  loadingMore?: boolean;
  loadingMoreNewer?: boolean;
  members?: OneChatChannelState<OneChatGenerics>['members'];
  messages?: OneChatMessage<OneChatGenerics>[];
  pinnedMessages?: OneChatMessage<OneChatGenerics>[];
  quotedMessage?: OneChatMessage<OneChatGenerics>;
  read?: OneChatChannelState<OneChatGenerics>['read'];
  thread?: OneChatMessage<OneChatGenerics> | null;
  threadHasMore?: boolean;
  threadLoadingMore?: boolean;
  threadMessages?: OneChatMessage<OneChatGenerics>[];
  threadSuppressAutoscroll?: boolean;
  typing?: OneChatChannelState<OneChatGenerics>['typing'];
  watcherCount?: number;
  watchers?: OneChatChannelState<OneChatGenerics>['watchers'];
};

export type ChannelStateContextValue<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = Omit<ChannelState<OneChatGenerics>, 'typing'> & {
  channel: Channel<OneChatGenerics>;
  channelCapabilities: Record<string, boolean>;
  channelConfig: ChannelConfigWithInfo<OneChatGenerics> | undefined;
  imageAttachmentSizeHandler: ImageAttachmentSizeHandler;
  multipleUploads: boolean;
  notifications: ChannelNotifications;
  shouldGenerateVideoThumbnail: boolean;
  videoAttachmentSizeHandler: VideoAttachmentSizeHandler;
  acceptedFiles?: string[];
  dragAndDropWindow?: boolean;
  giphyVersion?: GiphyVersions;
  maxNumberOfFiles?: number;
  mutes?: Array<Mute<OneChatGenerics>>;
  watcher_count?: number;
};

export const ChannelStateContext = React.createContext<ChannelStateContextValue | undefined>(
  undefined,
);

export const ChannelStateProvider = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>({
  children,
  value,
}: PropsWithChildren<{
  value: ChannelStateContextValue<OneChatGenerics>;
}>) => (
  <ChannelStateContext.Provider value={(value as unknown) as ChannelStateContextValue}>
    {children}
  </ChannelStateContext.Provider>
);

export const useChannelStateContext = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  componentName?: string,
) => {
  const contextValue = useContext(ChannelStateContext);

  if (!contextValue) {
    console.warn(
      `The useChannelStateContext hook was called outside of the ChannelStateContext provider. Make sure this hook is called within a child of the Channel component. The errored call is located in the ${componentName} component.`,
    );

    return {} as ChannelStateContextValue<OneChatGenerics>;
  }

  return (contextValue as unknown) as ChannelStateContextValue<OneChatGenerics>;
};

/**
 * Typescript currently does not support partial inference, so if ChannelStateContext
 * typing is desired while using the HOC withChannelStateContext, the Props for the
 * wrapped component must be provided as the first generic.
 */
export const withChannelStateContext = <
  P extends UnknownType,
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  Component: React.ComponentType<P>,
) => {
  const WithChannelStateContextComponent = (
    props: Omit<P, keyof ChannelStateContextValue<OneChatGenerics>>,
  ) => {
    const channelStateContext = useChannelStateContext<OneChatGenerics>();

    return <Component {...(props as P)} {...channelStateContext} />;
  };

  WithChannelStateContextComponent.displayName = (
    Component.displayName ||
    Component.name ||
    'Component'
  ).replace('Base', '');

  return WithChannelStateContextComponent;
};
