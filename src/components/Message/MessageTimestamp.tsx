import React, { useMemo } from 'react';

import { useMessageContext } from '../../context/MessageContext';
import { isDate, useTranslationContext } from '../../context/TranslationContext';

import type { OneChatMessage } from '../../context/ChannelStateContext';

import type { DefaultOneChatGenerics } from '../../types';
import { getDateString } from '../../i18n/utils';

export const defaultTimestampFormat = 'h:mmA';

export type MessageTimestampProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  /* If true, call the `Day.js` calendar function to get the date string to display. */
  calendar?: boolean;
  /* Adds a CSS class name to the component's outer `time` container. */
  customClass?: string;
  /* Overrides the default timestamp format */
  format?: string;
  /* The `OneChat` message object, which provides necessary data to the underlying UI components (overrides the value from `MessageContext`) */
  message?: OneChatMessage<OneChatGenerics>;
};

const UnMemoizedMessageTimestamp = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: MessageTimestampProps<OneChatGenerics>,
) => {
  const {
    calendar = false,
    customClass = '',
    format = defaultTimestampFormat,
    message: propMessage,
  } = props;

  const { formatDate, message: contextMessage } = useMessageContext<OneChatGenerics>(
    'MessageTimestamp',
  );
  const { tDateTimeParser } = useTranslationContext('MessageTimestamp');

  const message = propMessage || contextMessage;

  const messageCreatedAt =
    message.created_at && isDate(message.created_at)
      ? message.created_at.toISOString()
      : message.created_at;

  const when = useMemo(
    () => getDateString({ calendar, format, formatDate, messageCreatedAt, tDateTimeParser }),
    [formatDate, calendar, tDateTimeParser, format, messageCreatedAt],
  );

  if (!when) return null;

  return (
    <time className={customClass} dateTime={messageCreatedAt} title={messageCreatedAt}>
      {when}
    </time>
  );
};

export const MessageTimestamp = React.memo(
  UnMemoizedMessageTimestamp,
) as typeof UnMemoizedMessageTimestamp;
