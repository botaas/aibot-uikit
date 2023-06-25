import React, { PropsWithChildren, useContext } from 'react';

import type { AttachmentProps } from '../components/Attachment/Attachment';
import type { AvatarProps } from '../components/Avatar/Avatar';
import type { DateSeparatorProps } from '../components/DateSeparator/DateSeparator';
import type { EmptyStateIndicatorProps } from '../components/EmptyStateIndicator/EmptyStateIndicator';
import type { EventComponentProps } from '../components/EventComponent/EventComponent';
import type { LoadingIndicatorProps } from '../components/Loading/LoadingIndicator';
import type { FixedHeightMessageProps } from '../components/Message/FixedHeightMessage';
import type { MessageUIComponentProps, PinIndicatorProps } from '../components/Message/types';
import type { MessageDeletedProps } from '../components/Message/MessageDeleted';
import type { GiphyPreviewMessageProps } from '../components/MessageList/GiphyPreviewMessage';
import type { MessageListNotificationsProps } from '../components/MessageList/MessageListNotifications';
import type { MessageNotificationProps } from '../components/MessageList/MessageNotification';
import type { MessageOptionsProps } from '../components/Message/MessageOptions';
import type { MessageInputProps } from '../components/MessageInput/MessageInput';
import type { QuotedMessagePreviewProps } from '../components/MessageInput/QuotedMessagePreview';
import type { MessageProps } from '../components/Message/types';
import type { MessageRepliesCountButtonProps } from '../components/Message/MessageRepliesCountButton';
import type { MessageStatusProps } from '../components/Message/MessageStatus';
import type { MessageTimestampProps } from '../components/Message/MessageTimestamp';
import type { ModalGalleryProps } from '../components/Gallery/ModalGallery';
import type { ReactionSelectorProps } from '../components/Reactions/ReactionSelector';
import type { ReactionsListProps } from '../components/Reactions/ReactionsList';
import type {
  SuggestionItemProps,
  SuggestionListProps,
} from '../components/ChatAutoComplete/ChatAutoComplete';
import type { SuggestionListHeaderProps } from '../components/AutoCompleteTextarea';
import type { SendButtonProps } from '../components/MessageInput/icons';
import type { ThreadHeaderProps } from '../components/Thread/ThreadHeader';
import type { TypingIndicatorProps } from '../components/TypingIndicator/TypingIndicator';

import type { CustomTrigger, DefaultOneChatGenerics, UnknownType } from '../types';
import type { CooldownTimerProps } from '../components';

export type ComponentContextValue<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics,
  V extends CustomTrigger = CustomTrigger
> = {
  Attachment: React.ComponentType<AttachmentProps<OneChatGenerics>>;
  Message: React.ComponentType<MessageUIComponentProps<OneChatGenerics>>;
  AutocompleteSuggestionHeader?: React.ComponentType<SuggestionListHeaderProps>;
  AutocompleteSuggestionItem?: React.ComponentType<SuggestionItemProps<OneChatGenerics>>;
  AutocompleteSuggestionList?: React.ComponentType<SuggestionListProps<OneChatGenerics>>;
  Avatar?: React.ComponentType<AvatarProps<OneChatGenerics>>;
  CooldownTimer?: React.ComponentType<CooldownTimerProps>;
  DateSeparator?: React.ComponentType<DateSeparatorProps>;
  EditMessageInput?: React.ComponentType<MessageInputProps<OneChatGenerics>>;
  EmojiIcon?: React.ComponentType;
  EmptyStateIndicator?: React.ComponentType<EmptyStateIndicatorProps>;
  FileUploadIcon?: React.ComponentType;
  GiphyPreviewMessage?: React.ComponentType<GiphyPreviewMessageProps<OneChatGenerics>>;
  HeaderComponent?: React.ComponentType;
  Input?: React.ComponentType<MessageInputProps<OneChatGenerics, V>>;
  LoadingIndicator?: React.ComponentType<LoadingIndicatorProps>;
  MessageDeleted?: React.ComponentType<MessageDeletedProps<OneChatGenerics>>;
  MessageListNotifications?: React.ComponentType<MessageListNotificationsProps>;
  MessageNotification?: React.ComponentType<MessageNotificationProps>;
  MessageOptions?: React.ComponentType<MessageOptionsProps<OneChatGenerics>>;
  MessageRepliesCountButton?: React.ComponentType<MessageRepliesCountButtonProps>;
  MessageStatus?: React.ComponentType<MessageStatusProps>;
  MessageSystem?: React.ComponentType<EventComponentProps<OneChatGenerics>>;
  MessageTimestamp?: React.ComponentType<MessageTimestampProps<OneChatGenerics>>;
  ModalGallery?: React.ComponentType<ModalGalleryProps>;
  PinIndicator?: React.ComponentType<PinIndicatorProps<OneChatGenerics>>;
  QuotedMessage?: React.ComponentType;
  QuotedMessagePreview?: React.ComponentType<QuotedMessagePreviewProps<OneChatGenerics>>;
  ReactionSelector?: React.ForwardRefExoticComponent<ReactionSelectorProps<OneChatGenerics>>;
  ReactionsList?: React.ComponentType<ReactionsListProps<OneChatGenerics>>;
  SendButton?: React.ComponentType<SendButtonProps<OneChatGenerics>>;
  ThreadHead?: React.ComponentType<MessageProps<OneChatGenerics>>;
  ThreadHeader?: React.ComponentType<ThreadHeaderProps<OneChatGenerics>>;
  ThreadInput?: React.ComponentType<MessageInputProps<OneChatGenerics, V>>;
  ThreadStart?: React.ComponentType;
  TriggerProvider?: React.ComponentType;
  TypingIndicator?: React.ComponentType<TypingIndicatorProps>;
  VirtualMessage?: React.ComponentType<FixedHeightMessageProps<OneChatGenerics>>;
};

export const ComponentContext = React.createContext<ComponentContextValue | undefined>(undefined);

export const ComponentProvider = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics,
  V extends CustomTrigger = CustomTrigger
>({
  children,
  value,
}: PropsWithChildren<{
  value: Partial<ComponentContextValue<OneChatGenerics, V>>;
}>) => (
  <ComponentContext.Provider value={(value as unknown) as ComponentContextValue}>
    {children}
  </ComponentContext.Provider>
);

export const useComponentContext = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics,
  V extends CustomTrigger = CustomTrigger
>(
  componentName?: string,
) => {
  const contextValue = useContext(ComponentContext);

  if (!contextValue) {
    console.warn(
      `The useComponentContext hook was called outside of the ComponentContext provider. Make sure this hook is called within a child of the Channel component. The errored call is located in the ${componentName} component.`,
    );

    return {} as ComponentContextValue<OneChatGenerics, V>;
  }

  return contextValue as ComponentContextValue<OneChatGenerics, V>;
};

/**
 * Typescript currently does not support partial inference, so if ComponentContext
 * typing is desired while using the HOC withComponentContext, the Props for the
 * wrapped component must be provided as the first generic.
 */
export const withComponentContext = <
  P extends UnknownType,
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics,
  V extends CustomTrigger = CustomTrigger
>(
  Component: React.ComponentType<P>,
) => {
  const WithComponentContextComponent = (
    props: Omit<P, keyof ComponentContextValue<OneChatGenerics, V>>,
  ) => {
    const componentContext = useComponentContext<OneChatGenerics, V>();

    return <Component {...(props as P)} {...componentContext} />;
  };

  WithComponentContextComponent.displayName = (
    Component.displayName ||
    Component.name ||
    'Component'
  ).replace('Base', '');

  return WithComponentContextComponent;
};
