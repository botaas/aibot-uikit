import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ItemProps,
  ScrollSeekConfiguration,
  ScrollSeekPlaceholderProps,
  Virtuoso,
  VirtuosoHandle,
  VirtuosoProps,
} from 'react-virtuoso';

import { GiphyPreviewMessage as DefaultGiphyPreviewMessage } from './GiphyPreviewMessage';
import { useGiphyPreview } from './hooks/useGiphyPreview';
import { useNewMessageNotification } from './hooks/useNewMessageNotification';
import { usePrependedMessagesCount } from './hooks/usePrependMessagesCount';
import { useShouldForceScrollToBottom } from './hooks/useShouldForceScrollToBottom';
import { MessageNotification as DefaultMessageNotification } from './MessageNotification';
import { MessageListNotifications as DefaultMessageListNotifications } from './MessageListNotifications';
import { MessageListMainPanel } from './MessageListMainPanel';
import { getGroupStyles, GroupStyle, processMessages } from './utils';

import { CUSTOM_MESSAGE_TYPE } from '../../constants/messageTypes';
import { DateSeparator as DefaultDateSeparator } from '../DateSeparator/DateSeparator';
import { EmptyStateIndicator as DefaultEmptyStateIndicator } from '../EmptyStateIndicator/EmptyStateIndicator';
import { EventComponent } from '../EventComponent/EventComponent';
import { LoadingIndicator as DefaultLoadingIndicator } from '../Loading/LoadingIndicator';
import { Message, MessageProps, MessageSimple, MessageUIComponentProps } from '../Message';

import {
  ChannelActionContextValue,
  useChannelActionContext,
} from '../../context/ChannelActionContext';
import {
  ChannelNotifications,
  OneChatMessage,
  useChannelStateContext,
} from '../../context/ChannelStateContext';
import { CustomClasses, useChatContext } from '../../context/ChatContext';
import { useComponentContext } from '../../context/ComponentContext';
import { isDate } from '../../context/TranslationContext';

import type { Channel, DefaultOneChatGenerics, UnknownType } from '../../types';

const PREPEND_OFFSET = 10 ** 7;

type VirtualizedMessageListWithContextProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = VirtualizedMessageListProps<OneChatGenerics> & {
  channel: Channel<OneChatGenerics>;
  hasMore: boolean;
  hasMoreNewer: boolean;
  jumpToLatestMessage: () => Promise<void>;
  loadingMore: boolean;
  loadingMoreNewer: boolean;
  notifications: ChannelNotifications;
};

function captureResizeObserverExceededError(e: ErrorEvent) {
  if (
    e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
    e.message === 'ResizeObserver loop limit exceeded'
  ) {
    e.stopImmediatePropagation();
  }
}

function useCaptureResizeObserverExceededError() {
  useEffect(() => {
    window.addEventListener('error', captureResizeObserverExceededError);
    return () => {
      window.removeEventListener('error', captureResizeObserverExceededError);
    };
  }, []);
}

function fractionalItemSize(element: HTMLElement) {
  return element.getBoundingClientRect().height;
}

function findMessageIndex(messages: Array<{ id: string }>, id: string) {
  return messages.findIndex((message) => message.id === id);
}

function calculateInitialTopMostItemIndex(
  messages: Array<{ id: string }>,
  highlightedMessageId: string | undefined,
) {
  if (highlightedMessageId) {
    const index = findMessageIndex(messages, highlightedMessageId);
    if (index !== -1) {
      return { align: 'center', index } as const;
    }
  }
  return messages.length - 1;
}

type VirtualizedMessageListVirtuosoContext<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  processedMessages: OneChatMessage<OneChatGenerics>[];
  messageGroupStyles: Record<string, GroupStyle>;
  numItemsPrepended: number;
  customClasses?: CustomClasses;
};

const VirtualizedMessageListVirtuosoItem = <OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics>(
  props: ItemProps<OneChatMessage<OneChatGenerics>> & {
    context?: VirtualizedMessageListVirtuosoContext<OneChatGenerics>;
  },
) => {
  const { context, ...otherProps } = props;

  const {
    processedMessages,
    messageGroupStyles,
    numItemsPrepended,
    customClasses,
  } = context!;

  const streamMessageIndex = props['data-item-index'] + numItemsPrepended - PREPEND_OFFSET;
  const message = processedMessages[streamMessageIndex];
  const groupStyles: GroupStyle = messageGroupStyles[message.id] || '';

  // using 'display: inline-block'
  // traps CSS margins of the item elements, preventing incorrect item measurements
  return (
    <div
      {...otherProps}
      className={
        customClasses?.virtualMessage ||
        clsx('str-chat__virtual-list-message-wrapper str-chat__li', {
          [`str-chat__li--${groupStyles}`]: groupStyles,
        })
      }
    />
  );
};

const VirtualizedMessageListWithContext = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: VirtualizedMessageListWithContextProps<OneChatGenerics>,
) => {
  const {
    additionalVirtuosoProps,
    channel,
    closeReactionSelectorOnClick,
    customMessageRenderer,
    defaultItemHeight,
    disableDateSeparator = true,
    groupStyles,
    hasMore,
    hasMoreNewer,
    head,
    hideDeletedMessages = false,
    hideNewMessageSeparator = false,
    highlightedMessageId,
    jumpToLatestMessage,
    loadingMore,
    loadMore,
    loadMoreNewer,
    Message: propMessage,
    messageLimit = 100,
    messages,
    notifications,
    // TODO: refactor to scrollSeekPlaceHolderConfiguration and components.ScrollSeekPlaceholder, like the Virtuoso Component
    overscan = 0,
    scrollSeekPlaceHolder,
    scrollToLatestMessageOnFocus = false,
    separateGiphyPreview = false,
    shouldGroupByUser = false,
    stickToBottomScrollBehavior = 'smooth',
    suppressAutoscroll,
    threadList,
  } = props;

  // Stops errors generated from react-virtuoso to bubble up
  // to Sentry or other tracking tools.
  useCaptureResizeObserverExceededError();

  const {
    DateSeparator = DefaultDateSeparator,
    EmptyStateIndicator = DefaultEmptyStateIndicator,
    GiphyPreviewMessage = DefaultGiphyPreviewMessage,
    LoadingIndicator = DefaultLoadingIndicator,
    MessageListNotifications = DefaultMessageListNotifications,
    MessageNotification = DefaultMessageNotification,
    MessageSystem = EventComponent,
    TypingIndicator = null,
    VirtualMessage: contextMessage = MessageSimple,
  } = useComponentContext<OneChatGenerics>('VirtualizedMessageList');

  const { client, customClasses } = useChatContext<OneChatGenerics>('VirtualizedMessageList');

  const lastRead = useMemo(() => channel.lastRead?.(), [channel]);

  const MessageUIComponent = propMessage || contextMessage;

  const { giphyPreviewMessage, setGiphyPreviewMessage } = useGiphyPreview<OneChatGenerics>(
    separateGiphyPreview,
  );

  const processedMessages = useMemo(() => {
    if (typeof messages === 'undefined') {
      return [];
    }

    if (
      disableDateSeparator &&
      !hideDeletedMessages &&
      hideNewMessageSeparator &&
      !separateGiphyPreview
    ) {
      return messages;
    }

    return processMessages({
      enableDateSeparator: !disableDateSeparator,
      hideDeletedMessages,
      hideNewMessageSeparator,
      lastRead,
      messages,
      setGiphyPreviewMessage,
      userId: client.userID || '',
    });
  }, [
    disableDateSeparator,
    hideDeletedMessages,
    hideNewMessageSeparator,
    lastRead,
    messages,
    messages?.length,
    client.userID,
  ]);

  const groupStylesFn = groupStyles || getGroupStyles;
  const messageGroupStyles = useMemo(
    () =>
      processedMessages.reduce<Record<string, GroupStyle>>((acc, message, i) => {
        const style = groupStylesFn(
          message,
          processedMessages[i - 1],
          processedMessages[i + 1],
          !shouldGroupByUser,
        );
        if (style) acc[message.id] = style;
        return acc;
      }, {}),
    // processedMessages were incorrectly rebuilt with a new object identity at some point, hence the .length usage
    [processedMessages.length, shouldGroupByUser],
  );

  const virtuoso = useRef<VirtuosoHandle>(null);

  const {
    atBottom,
    isMessageListScrolledToBottom,
    newMessagesNotification,
    setIsMessageListScrolledToBottom,
    setNewMessagesNotification,
  } = useNewMessageNotification(processedMessages, client.userID, hasMoreNewer);

  const scrollToBottom = useCallback(async () => {
    if (hasMoreNewer) {
      await jumpToLatestMessage();
      return;
    }

    if (virtuoso.current) {
      virtuoso.current.scrollToIndex(processedMessages.length - 1);
    }

    setNewMessagesNotification(false);
  }, [
    virtuoso,
    processedMessages,
    setNewMessagesNotification,
    // processedMessages were incorrectly rebuilt with a new object identity at some point, hence the .length usage
    processedMessages.length,
    hasMoreNewer,
    jumpToLatestMessage,
  ]);

  const [newMessagesReceivedInBackground, setNewMessagesReceivedInBackground] = React.useState(
    false,
  );

  const resetNewMessagesReceivedInBackground = useCallback(() => {
    setNewMessagesReceivedInBackground(false);
  }, []);

  useEffect(() => {
    setNewMessagesReceivedInBackground(true);
  }, [messages]);

  const scrollToBottomIfConfigured = useCallback(
    (event: Event) => {
      if (scrollToLatestMessageOnFocus && event.target === window) {
        if (newMessagesReceivedInBackground) {
          setTimeout(scrollToBottom, 100);
        }
      }
    },
    [scrollToLatestMessageOnFocus, scrollToBottom, newMessagesReceivedInBackground],
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', scrollToBottomIfConfigured);
      window.addEventListener('blur', resetNewMessagesReceivedInBackground);
    }

    return () => {
      window.removeEventListener('focus', scrollToBottomIfConfigured);
      window.removeEventListener('blur', resetNewMessagesReceivedInBackground);
    };
  }, [scrollToBottomIfConfigured]);

  const numItemsPrepended = usePrependedMessagesCount(processedMessages, !disableDateSeparator);

  /**
   * Logic to update the key of the virtuoso component when the list jumps to a new location.
   */
  const [messageSetKey, setMessageSetKey] = useState(+new Date());
  const firstMessageId = useRef<string | undefined>();

  useEffect(() => {
    const continuousSet = messages?.find((message) => message.id === firstMessageId.current);
    if (!continuousSet) {
      setMessageSetKey(+new Date());
    }
    firstMessageId.current = messages?.[0]?.id;
  }, [messages]);

  const shouldForceScrollToBottom = useShouldForceScrollToBottom(processedMessages, client.userID);

  const followOutput = (isAtBottom: boolean) => {
    if (hasMoreNewer || suppressAutoscroll) {
      return false;
    }

    if (shouldForceScrollToBottom()) {
      return isAtBottom ? stickToBottomScrollBehavior : 'auto';
    }
    // a message from another user has been received - don't scroll to bottom unless already there
    return isAtBottom ? stickToBottomScrollBehavior : false;
  };

  const messageRenderer = useCallback(
    (messageList: OneChatMessage<OneChatGenerics>[], virtuosoIndex: number) => {
      const streamMessageIndex = virtuosoIndex + numItemsPrepended - PREPEND_OFFSET;
      // use custom renderer supplied by client if present and skip the rest
      if (customMessageRenderer) {
        return customMessageRenderer(messageList, streamMessageIndex);
      }

      const message = messageList[streamMessageIndex];

      if (message.customType === CUSTOM_MESSAGE_TYPE.date && message.date && isDate(message.date)) {
        return <DateSeparator date={message.date} unread={message.unread} />;
      }

      if (!message) return <div style={{ height: '1px' }}></div>; // returning null or zero height breaks the virtuoso

      if (message.type === 'system') {
        return <MessageSystem message={message} />;
      }

      const groupedByUser =
        shouldGroupByUser &&
        streamMessageIndex > 0 &&
        message.user?.id === messageList[streamMessageIndex - 1].user?.id;

      const firstOfGroup =
        shouldGroupByUser && message.user?.id !== messageList[streamMessageIndex - 1]?.user?.id;

      const endOfGroup =
        shouldGroupByUser && message.user?.id !== messageList[streamMessageIndex + 1]?.user?.id;

      const showName = !!message.user?.name;

      return (
        <Message
          // autoscrollToBottom={virtuoso.current?.autoscrollToBottom}
          autoscrollToBottom={() => {
            // TODO 这里应该直接调上面 autoscrollToBottom 就可以了，virtuoso 应该会自己处理保持底部
            // 但是实际没有效果，因此调 scrollToIndex 来处理
            const behavior = followOutput(atBottom.current);
            if (behavior) {
              virtuoso.current?.scrollToIndex({ index: 'LAST', behavior, align: 'end' });
            }
          }}
          closeReactionSelectorOnClick={closeReactionSelectorOnClick}
          customMessageActions={props.customMessageActions}
          endOfGroup={endOfGroup}
          firstOfGroup={firstOfGroup}
          groupedByUser={groupedByUser}
          message={message}
          Message={MessageUIComponent}
          messageActions={props.messageActions}
          showName={showName}
        />
      );
    },
    [customMessageRenderer, shouldGroupByUser, numItemsPrepended],
  );

  const virtuosoComponents = useMemo((): any => {
    const EmptyPlaceholder = () => (
      <>
        {EmptyStateIndicator && (
          <EmptyStateIndicator listType={threadList ? 'thread' : 'message'} />
        )}
      </>
    );

    const Header = () =>
      loadingMore ? (
        <div className='str-chat__virtual-list__loading'>
          <LoadingIndicator size={20} />
        </div>
      ) : (
        head || null
      );

    const Footer = () =>
      TypingIndicator ? <TypingIndicator avatarSize={24} /> : <></>;

    return {
      EmptyPlaceholder,
      Footer,
      Header,
      Item: VirtualizedMessageListVirtuosoItem<OneChatGenerics>,
    };
  }, [loadingMore, head]);

  const atBottomStateChange = (isAtBottom: boolean) => {
    atBottom.current = isAtBottom;
    setIsMessageListScrolledToBottom(isAtBottom);
    if (isAtBottom && newMessagesNotification) {
      setNewMessagesNotification(false);
    }
  };

  const startReached = () => {
    if (hasMore && loadMore) {
      loadMore(messageLimit);
    }
  };

  const endReached = () => {
    if (hasMoreNewer && loadMoreNewer) {
      loadMoreNewer(messageLimit);
    }
  };

  useEffect(() => {
    if (highlightedMessageId) {
      const index = findMessageIndex(processedMessages, highlightedMessageId);
      if (index !== -1) {
        virtuoso.current?.scrollToIndex({ align: 'center', index });
      }
    }
  }, [highlightedMessageId]);

  if (!processedMessages) return null;

  return (
    <>
      <MessageListMainPanel>
        <div className={customClasses?.virtualizedMessageList || 'str-chat__virtual-list'}>
          <Virtuoso
            context={{
              processedMessages,
              messageGroupStyles,
              numItemsPrepended,
              customClasses,
            }}
            atBottomStateChange={atBottomStateChange}
            atBottomThreshold={200}
            className='str-chat__message-list-scroll'
            components={virtuosoComponents}
            computeItemKey={(index) =>
              processedMessages[numItemsPrepended + index - PREPEND_OFFSET].id
            }
            endReached={endReached}
            firstItemIndex={PREPEND_OFFSET - numItemsPrepended}
            followOutput={followOutput}
            increaseViewportBy={{ bottom: 200, top: 0 }}
            initialTopMostItemIndex={calculateInitialTopMostItemIndex(
              processedMessages,
              highlightedMessageId,
            )}
            itemContent={(i) => messageRenderer(processedMessages, i)}
            itemSize={fractionalItemSize}
            key={messageSetKey}
            overscan={overscan}
            ref={virtuoso}
            startReached={startReached}
            style={{ overflowX: 'hidden' }}
            totalCount={processedMessages.length}
            {...additionalVirtuosoProps}
            {...(scrollSeekPlaceHolder ? { scrollSeek: scrollSeekPlaceHolder } : {})}
            {...(defaultItemHeight ? { defaultItemHeight } : {})}
          />
        </div>
      </MessageListMainPanel>
      <MessageListNotifications
        hasNewMessages={newMessagesNotification}
        isMessageListScrolledToBottom={isMessageListScrolledToBottom}
        isNotAtLatestMessageSet={hasMoreNewer}
        MessageNotification={MessageNotification}
        notifications={notifications}
        scrollToBottom={scrollToBottom}
        threadList={threadList}
      />
      {giphyPreviewMessage && <GiphyPreviewMessage message={giphyPreviewMessage} />}
    </>
  );
};

export type VirtualizedMessageListProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = Partial<Pick<MessageProps<OneChatGenerics>, 'customMessageActions' | 'messageActions'>> & {
  /** Additional props to be passed the underlying [`react-virtuoso` virtualized list dependency](https://virtuoso.dev/virtuoso-api-reference/) */
  additionalVirtuosoProps?: VirtuosoProps<UnknownType, unknown>;
  /** If true, picking a reaction from the `ReactionSelector` component will close the selector */
  closeReactionSelectorOnClick?: boolean;
  /** Custom render function, if passed, certain UI props are ignored */
  customMessageRenderer?: (
    messageList: OneChatMessage<OneChatGenerics>[],
    index: number,
  ) => React.ReactElement;
  /** If set, the default item height is used for the calculation of the total list height. Use if you expect messages with a lot of height variance */
  defaultItemHeight?: number;
  /** Disables the injection of date separator components in MessageList, defaults to `true` */
  disableDateSeparator?: boolean;
  /** Callback function to set group styles for each message */
  groupStyles?: (
    message: OneChatMessage<OneChatGenerics>,
    previousMessage: OneChatMessage<OneChatGenerics>,
    nextMessage: OneChatMessage<OneChatGenerics>,
    noGroupByUser: boolean,
  ) => GroupStyle;
  /** Whether or not the list has more items to load */
  hasMore?: boolean;
  /** Whether or not the list has newer items to load */
  hasMoreNewer?: boolean;
  /** Element to be rendered at the top of the thread message list. By default, these are the Message and ThreadStart components */
  head?: React.ReactElement;
  /** Hides the `MessageDeleted` components from the list, defaults to `false` */
  hideDeletedMessages?: boolean;
  /** Hides the `DateSeparator` component when new messages are received in a channel that's watched but not active, defaults to false */
  hideNewMessageSeparator?: boolean;
  /** The id of the message to highlight and center */
  highlightedMessageId?: string;
  /** Whether or not the list is currently loading more items */
  loadingMore?: boolean;
  /** Whether or not the list is currently loading newer items */
  loadingMoreNewer?: boolean;
  /** Function called when more messages are to be loaded, defaults to function stored in [ChannelActionContext](https://openbot.chat/chat/docs/sdk/react/contexts/channel_action_context/) */
  loadMore?: ChannelActionContextValue['loadMore'] | (() => Promise<void>);
  /** Function called when new messages are to be loaded, defaults to function stored in [ChannelActionContext](https://openbot.chat/chat/docs/sdk/react/contexts/channel_action_context/) */
  loadMoreNewer?: ChannelActionContextValue['loadMore'] | (() => Promise<void>);
  /** Custom UI component to display a message, defaults to and accepts same props as [MessageSimple](https://github.com/botaas/aibot-uikit/blob/master/src/components/Message/MessageSimple.tsx) */
  Message?: React.ComponentType<MessageUIComponentProps<OneChatGenerics>>;
  /** The limit to use when paginating messages */
  messageLimit?: number;
  /** Optional prop to override the messages available from [ChannelStateContext](https://openbot.chat/chat/docs/sdk/react/contexts/channel_state_context/) */
  messages?: OneChatMessage<OneChatGenerics>[];
  /** The amount of extra content the list should render in addition to what's necessary to fill in the viewport */
  overscan?: number;
  /**
   * Performance improvement by showing placeholders if user scrolls fast through list.
   * it can be used like this:
   * ```
   *  {
   *    enter: (velocity) => Math.abs(velocity) > 120,
   *    exit: (velocity) => Math.abs(velocity) < 40,
   *    change: () => null,
   *    placeholder: ({index, height})=> <div style={{height: height + "px"}}>{index}</div>,
   *  }
   *  ```
   */
  scrollSeekPlaceHolder?: ScrollSeekConfiguration & {
    placeholder: React.ComponentType<ScrollSeekPlaceholderProps>;
  };
  /** When `true`, the list will scroll to the latest message when the window regains focus */
  scrollToLatestMessageOnFocus?: boolean;
  /** If true, the Giphy preview will render as a separate component above the `MessageInput`, rather than inline with the other messages in the list */
  separateGiphyPreview?: boolean;
  /** If true, group messages belonging to the same user, otherwise show each message individually */
  shouldGroupByUser?: boolean;
  /** The scrollTo behavior when new messages appear. Use `"smooth"` for regular chat channels, and `"auto"` (which results in instant scroll to bottom) if you expect high throughput. */
  stickToBottomScrollBehavior?: 'smooth' | 'auto';
  /** stops the list from autoscrolling when new messages are loaded */
  suppressAutoscroll?: boolean;
  /** If true, indicates the message list is a thread  */
  threadList?: boolean;
};

/**
 * The VirtualizedMessageList component renders a list of messages in a virtualized list.
 * It is a consumer of the React contexts set in [Channel](https://github.com/botaas/aibot-uikit/blob/master/src/components/Channel/Channel.tsx).
 */
export function VirtualizedMessageList<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(props: VirtualizedMessageListProps<OneChatGenerics>) {
  const { jumpToLatestMessage, loadMore, loadMoreNewer } = useChannelActionContext<OneChatGenerics>(
    'VirtualizedMessageList',
  );
  const {
    channel,
    hasMore,
    hasMoreNewer,
    highlightedMessageId,
    loadingMore,
    loadingMoreNewer,
    messages: contextMessages,
    notifications,
    suppressAutoscroll,
  } = useChannelStateContext<OneChatGenerics>('VirtualizedMessageList');

  const messages = props.messages || contextMessages;

  return (
    <VirtualizedMessageListWithContext
      channel={channel}
      hasMore={!!hasMore}
      hasMoreNewer={!!hasMoreNewer}
      highlightedMessageId={highlightedMessageId}
      jumpToLatestMessage={jumpToLatestMessage}
      loadingMore={!!loadingMore}
      loadingMoreNewer={!!loadingMoreNewer}
      loadMore={loadMore}
      loadMoreNewer={loadMoreNewer}
      messages={messages}
      notifications={notifications}
      suppressAutoscroll={suppressAutoscroll}
      {...props}
    />
  );
}
