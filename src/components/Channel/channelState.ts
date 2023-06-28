import type { Reducer } from 'react';

import type { ChannelState, OneChatMessage } from '../../context/ChannelStateContext';

import type {
  Channel,
  DefaultOneChatGenerics,
  MessageResponse,
  ChannelState as OneChatChannelState,
} from '../../types';

export type ChannelStateReducerAction<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> =
  | {
      type: 'closeThread';
    }
  | {
      type: 'clearHighlightedMessage';
    }
  | {
      channel: Channel<OneChatGenerics>;
      type: 'copyMessagesFromChannel';
      parentId?: string | null;
    }
  | {
      channel: Channel<OneChatGenerics>;
      type: 'copyStateFromChannelOnEvent';
    }
  | {
      hasMoreNewer: boolean;
      highlightedMessageId: string;
      type: 'jumpToMessageFinished';
    }
  | {
      channel: Channel<OneChatGenerics>;
      type: 'initStateFromChannel';
    }
  | {
      hasMore: boolean;
      messages: OneChatMessage<OneChatGenerics>[];
      type: 'loadMoreFinished';
    }
  | {
      hasMoreNewer: boolean;
      messages: OneChatMessage<OneChatGenerics>[];
      type: 'loadMoreNewerFinished';
    }
  | {
      threadHasMore: boolean;
      threadMessages: Array<ReturnType<OneChatChannelState<OneChatGenerics>['formatMessage']>>;
      type: 'loadMoreThreadFinished';
    }
  | {
      channel: Channel<OneChatGenerics>;
      message: OneChatMessage<OneChatGenerics>;
      type: 'openThread';
    }
  | {
      error: Error;
      type: 'setError';
    }
  | {
      loadingMore: boolean;
      type: 'setLoadingMore';
    }
  | {
      loadingMoreNewer: boolean;
      type: 'setLoadingMoreNewer';
    }
  | {
      message: OneChatMessage<OneChatGenerics>;
      type: 'setThread';
    }
  | {
      channel: Channel<OneChatGenerics>;
      type: 'setTyping';
    }
  | {
      type: 'startLoadingThread';
    }
  | {
      channel: Channel<OneChatGenerics>;
      message: MessageResponse<OneChatGenerics>;
      type: 'updateThreadOnEvent';
    }
  | {
      type: 'jumpToLatestMessage';
    };

export type ChannelStateReducer<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = Reducer<ChannelState<OneChatGenerics>, ChannelStateReducerAction<OneChatGenerics>>;

export const channelReducer = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  state: ChannelState<OneChatGenerics>,
  action: ChannelStateReducerAction<OneChatGenerics>,
) => {
  switch (action.type) {
    case 'closeThread': {
      return {
        ...state,
        thread: null,
        threadLoadingMore: false,
        threadMessages: [],
      };
    }

    case 'copyMessagesFromChannel': {
      const { channel, parentId } = action;
      return {
        ...state,
        messages: [...channel.state.messages],
        pinnedMessages: [...channel.state.pinnedMessages],
        // copying messages from channel happens with new message - this resets the suppressAutoscroll
        suppressAutoscroll: false,
        threadMessages: parentId
          ? { ...channel.state.threads }[parentId] || []
          : state.threadMessages,
      };
    }

    case 'copyStateFromChannelOnEvent': {
      const { channel } = action;
      return {
        ...state,
        members: { ...channel.state.members },
        messages: [...channel.state.messages],
        pinnedMessages: [...channel.state.pinnedMessages],
        read: { ...channel.state.read },
        watcherCount: channel.state.watcher_count,
        watchers: { ...channel.state.watchers },
      };
    }

    case 'initStateFromChannel': {
      const { channel } = action;
      return {
        ...state,
        loading: false,
        members: { ...channel.state.members },
        messages: [...channel.state.messages],
        pinnedMessages: [...channel.state.pinnedMessages],
        read: { ...channel.state.read },
        watcherCount: channel.state.watcher_count,
        watchers: { ...channel.state.watchers },
      };
    }

    case 'jumpToLatestMessage': {
      return {
        ...state,
        hasMoreNewer: false,
        highlightedMessageId: undefined,
        loading: false,
        suppressAutoscroll: false,
      };
    }

    case 'jumpToMessageFinished': {
      return {
        ...state,
        hasMoreNewer: action.hasMoreNewer,
        highlightedMessageId: action.highlightedMessageId,
      };
    }

    case 'clearHighlightedMessage': {
      return {
        ...state,
        highlightedMessageId: undefined,
      };
    }

    case 'loadMoreFinished': {
      const { hasMore, messages } = action;
      return {
        ...state,
        hasMore,
        loadingMore: false,
        messages,
        suppressAutoscroll: false,
      };
    }

    case 'loadMoreNewerFinished': {
      const { hasMoreNewer, messages } = action;
      return {
        ...state,
        hasMoreNewer,
        loadingMoreNewer: false,
        messages,
      };
    }

    case 'loadMoreThreadFinished': {
      const { threadHasMore, threadMessages } = action;
      return {
        ...state,
        threadHasMore,
        threadLoadingMore: false,
        threadMessages,
      };
    }

    case 'openThread': {
      const { channel, message } = action;
      return {
        ...state,
        thread: message,
        threadMessages: message.id ? { ...channel.state.threads }[message.id] || [] : [],
        threadSuppressAutoscroll: false,
      };
    }

    case 'setError': {
      const { error } = action;
      return { ...state, error };
    }

    case 'setLoadingMore': {
      const { loadingMore } = action;
      // suppress the autoscroll behavior
      return { ...state, loadingMore, suppressAutoscroll: loadingMore };
    }

    case 'setLoadingMoreNewer': {
      const { loadingMoreNewer } = action;
      return { ...state, loadingMoreNewer };
    }

    case 'setThread': {
      const { message } = action;
      return { ...state, thread: message };
    }

    case 'setTyping': {
      const { channel } = action;
      return {
        ...state,
        typing: { ...channel.state.typing },
      };
    }

    case 'startLoadingThread': {
      return {
        ...state,
        threadLoadingMore: true,
        threadSuppressAutoscroll: true,
      };
    }

    case 'updateThreadOnEvent': {
      const { channel, message } = action;
      if (!state.thread) return state;
      return {
        ...state,
        thread:
          message?.id === state.thread.id ? channel.state.formatMessage(message) : state.thread,
        threadMessages: state.thread?.id ? { ...channel.state.threads }[state.thread.id] || [] : [],
      };
    }

    default:
      return state;
  }
};

export const initialState = {
  error: null,
  hasMore: true,
  hasMoreNewer: false,
  loading: true,
  loadingMore: false,
  members: {},
  messages: [],
  pinnedMessages: [],
  read: {},
  suppressAutoscroll: false,
  thread: null,
  threadHasMore: true,
  threadLoadingMore: false,
  threadMessages: [],
  threadSuppressAutoscroll: false,
  typing: {},
  watcherCount: 0,
  watchers: {},
};
