import { useMemo } from 'react';

import { getGroupStyles, GroupStyle, insertIntro, processMessages } from '../utils';

import { useChatContext } from '../../../context/ChatContext';
import { useComponentContext } from '../../../context/ComponentContext';

import type { OneChatMessage } from '../../../context/ChannelStateContext';

import type { Channel, DefaultOneChatGenerics } from '../../../types';

export const useEnrichedMessages = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(args: {
  channel: Channel<OneChatGenerics>;
  disableDateSeparator: boolean;
  hideDeletedMessages: boolean;
  hideNewMessageSeparator: boolean;
  messages: OneChatMessage<OneChatGenerics>[];
  noGroupByUser: boolean;
  groupStyles?: (
    message: OneChatMessage<OneChatGenerics>,
    previousMessage: OneChatMessage<OneChatGenerics>,
    nextMessage: OneChatMessage<OneChatGenerics>,
    noGroupByUser: boolean,
  ) => GroupStyle;
  headerPosition?: number;
}) => {
  const {
    channel,
    disableDateSeparator,
    groupStyles,
    headerPosition,
    hideDeletedMessages,
    hideNewMessageSeparator,
    messages,
    noGroupByUser,
  } = args;

  const { client } = useChatContext<OneChatGenerics>('useEnrichedMessages');
  const { HeaderComponent } = useComponentContext<OneChatGenerics>('useEnrichedMessages');

  const lastRead = useMemo(() => channel.lastRead?.(), [channel]);

  const enableDateSeparator = !disableDateSeparator;

  let messagesWithDates =
    !enableDateSeparator && !hideDeletedMessages && hideNewMessageSeparator
      ? messages
      : processMessages({
          enableDateSeparator,
          hideDeletedMessages,
          hideNewMessageSeparator,
          lastRead,
          messages,
          userId: client.userID || '',
        });

  if (HeaderComponent) {
    messagesWithDates = insertIntro(messagesWithDates, headerPosition);
  }

  const groupStylesFn = groupStyles || getGroupStyles;
  const messageGroupStyles = useMemo(
    () =>
      messagesWithDates.reduce<Record<string, GroupStyle>>((acc, message, i) => {
        const style = groupStylesFn(
          message,
          messagesWithDates[i - 1],
          messagesWithDates[i + 1],
          noGroupByUser,
        );
        if (style) acc[message.id] = style;
        return acc;
      }, {}),
    [messagesWithDates, noGroupByUser],
  );

  return { messageGroupStyles, messages: messagesWithDates };
};
