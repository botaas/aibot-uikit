import React, { PropsWithChildren, useContext } from 'react';

import { getDisplayName } from './utils/getDisplayName';
import type { ChatProps } from '../components/Chat/Chat';
import type { AppSettingsAPIResponse, Channel, Mute, DefaultOneChatGenerics, UnknownType } from '../types';
import type { ChannelsQueryState } from '../components/Chat/hooks/useChannelsQueryState';

type CSSClasses =
  | 'chat'
  | 'chatContainer'
  | 'channel'
  | 'channelList'
  | 'message'
  | 'messageList'
  | 'thread'
  | 'threadList'
  | 'virtualMessage'
  | 'virtualizedMessageList';

export type CustomClasses = Partial<Record<CSSClasses, string>>;

type ChannelCID = string; // e.g.: "messaging:general"

export type ThemeVersion = '1' | '2';

export type ChatContextValue<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  channelsQueryState: ChannelsQueryState;
  closeMobileNav: () => void;
  getAppSettings: () => Promise<AppSettingsAPIResponse<OneChatGenerics>> | null;
  latestMessageDatesByChannels: Record<ChannelCID, Date>;
  mutes: Array<Mute<OneChatGenerics>>;
  openMobileNav: () => void;
  setActiveChannel: (
    newChannel?: Channel<OneChatGenerics>,
    watchers?: { limit?: number; offset?: number },
    event?: React.BaseSyntheticEvent,
  ) => void;
  themeVersion: ThemeVersion;
  useImageFlagEmojisOnWindows: boolean;
  channel?: Channel<OneChatGenerics>;
  customClasses?: CustomClasses;
  navOpen?: boolean;
} & Required<Pick<ChatProps<OneChatGenerics>, 'theme' | 'client'>>;

export const ChatContext = React.createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>({
  children,
  value,
}: PropsWithChildren<{
  value: ChatContextValue<OneChatGenerics>;
}>) => (
  <ChatContext.Provider value={(value as unknown) as ChatContextValue}>
    {children}
  </ChatContext.Provider>
);

export const useChatContext = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  componentName?: string,
) => {
  const contextValue = useContext(ChatContext);

  if (!contextValue) {
    console.warn(
      `The useChatContext hook was called outside of the ChatContext provider. Make sure this hook is called within a child of the Chat component. The errored call is located in the ${componentName} component.`,
    );

    return {} as ChatContextValue<OneChatGenerics>;
  }

  return (contextValue as unknown) as ChatContextValue<OneChatGenerics>;
};

/**
 * Typescript currently does not support partial inference so if ChatContext
 * typing is desired while using the HOC withChatContext the Props for the
 * wrapped component must be provided as the first generic.
 */
export const withChatContext = <
  P extends UnknownType,
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  Component: React.ComponentType<P>,
) => {
  const WithChatContextComponent = (props: Omit<P, keyof ChatContextValue<OneChatGenerics>>) => {
    const chatContext = useChatContext<OneChatGenerics>();

    return <Component {...(props as P)} {...chatContext} />;
  };
  WithChatContextComponent.displayName = `WithChatContext${getDisplayName(Component)}`;
  return WithChatContextComponent;
};
