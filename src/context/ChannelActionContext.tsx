import React, { PropsWithChildren, useContext } from 'react';

import type { OneChatMessage } from './ChannelStateContext';

import type { ChannelStateReducerAction } from '../components/Channel/channelState';
import type { CustomMentionHandler } from '../components/Message/hooks/useMentionsHandler';

import type {
  APIErrorResponse,
  Attachment,
  DefaultOneChatGenerics,
  ErrorFromResponse,
  Message,
  UnknownType,
  UpdatedMessage,
  UpdateMessageAPIResponse,
  UserResponse,
} from '../types';

export type MessageAttachments<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = Array<Attachment<OneChatGenerics>>;

export type MessageToSend<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  attachments?: MessageAttachments<OneChatGenerics>;
  error?: ErrorFromResponse<APIErrorResponse>;
  errorStatusCode?: number;
  id?: string;
  mentioned_users?: UserResponse<OneChatGenerics>[];
  parent?: OneChatMessage<OneChatGenerics>;
  parent_id?: string;
  status?: string;
  text?: string;
};

export type RetrySendMessage<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = (message: OneChatMessage<OneChatGenerics>) => Promise<void>;

export type ChannelActionContextValue<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  addNotification: (text: string, type: 'success' | 'error') => void;
  closeThread: (event?: React.BaseSyntheticEvent) => void;
  dispatch: React.Dispatch<ChannelStateReducerAction<OneChatGenerics>>;
  editMessage: (
    message: UpdatedMessage<OneChatGenerics>,
  ) => Promise<UpdateMessageAPIResponse<OneChatGenerics> | void>;
  jumpToLatestMessage: () => Promise<void>;
  jumpToMessage: (messageId: string, limit?: number) => Promise<void>;
  loadMore: (limit?: number) => Promise<number>;
  loadMoreNewer: (limit?: number) => Promise<number>;
  loadMoreThread: () => Promise<void>;
  onMentionsClick: CustomMentionHandler<OneChatGenerics>;
  onMentionsHover: CustomMentionHandler<OneChatGenerics>;
  openThread: (message: OneChatMessage<OneChatGenerics>, event?: React.BaseSyntheticEvent) => void;
  removeMessage: (message: OneChatMessage<OneChatGenerics>) => void;
  retrySendMessage: RetrySendMessage<OneChatGenerics>;
  sendMessage: (
    message: MessageToSend<OneChatGenerics>,
    customMessageData?: Partial<Message<OneChatGenerics>>,
  ) => Promise<void>;
  setQuotedMessage: React.Dispatch<
    React.SetStateAction<OneChatMessage<OneChatGenerics> | undefined>
  >;
  updateMessage: (message: OneChatMessage<OneChatGenerics>) => void;
};

export const ChannelActionContext = React.createContext<ChannelActionContextValue | undefined>(
  undefined,
);

export const ChannelActionProvider = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>({
  children,
  value,
}: PropsWithChildren<{
  value: ChannelActionContextValue<OneChatGenerics>;
}>) => (
  <ChannelActionContext.Provider value={(value as unknown) as ChannelActionContextValue}>
    {children}
  </ChannelActionContext.Provider>
);

export const useChannelActionContext = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  componentName?: string,
) => {
  const contextValue = useContext(ChannelActionContext);

  if (!contextValue) {
    console.warn(
      `The useChannelActionContext hook was called outside of the ChannelActionContext provider. Make sure this hook is called within a child of the Channel component. The errored call is located in the ${componentName} component.`,
    );

    return {} as ChannelActionContextValue<OneChatGenerics>;
  }

  return (contextValue as unknown) as ChannelActionContextValue<OneChatGenerics>;
};

/**
 * Typescript currently does not support partial inference, so if ChannelActionContext
 * typing is desired while using the HOC withChannelActionContext, the Props for the
 * wrapped component must be provided as the first generic.
 */
export const withChannelActionContext = <
  P extends UnknownType,
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  Component: React.ComponentType<P>,
) => {
  const WithChannelActionContextComponent = (
    props: Omit<P, keyof ChannelActionContextValue<OneChatGenerics>>,
  ) => {
    const channelActionContext = useChannelActionContext<OneChatGenerics>();

    return <Component {...(props as P)} {...channelActionContext} />;
  };

  WithChannelActionContextComponent.displayName = (
    Component.displayName ||
    Component.name ||
    'Component'
  ).replace('Base', '');

  return WithChannelActionContextComponent;
};
