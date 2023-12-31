import React, { useCallback } from 'react';
import clsx from 'clsx';
import useResizeObserver from 'use-resize-observer';

import { MessageErrorIcon } from './icons';
import { MessageDeleted as DefaultMessageDeleted } from './MessageDeleted';
import { MessageOptions as DefaultMessageOptions } from './MessageOptions';
import { MessageRepliesCountButton as DefaultMessageRepliesCountButton } from './MessageRepliesCountButton';
import { MessageStatus as DefaultMessageStatus } from './MessageStatus';
import { MessageText } from './MessageText';
import { MessageTimestamp as DefaultMessageTimestamp } from './MessageTimestamp';
import { areMessageUIPropsEqual, messageHasAttachments, messageHasReactions } from './utils';

import { Avatar as DefaultAvatar } from '../Avatar';
import { CUSTOM_MESSAGE_TYPE } from '../../constants/messageTypes';
import { EditMessageForm as DefaultEditMessageForm, MessageInput } from '../MessageInput';
import { MML } from '../MML';
import { Modal } from '../Modal';
import {
  ReactionsList as DefaultReactionList,
  ReactionSelector as DefaultReactionSelector,
} from '../Reactions';

import { useChatContext } from '../../context/ChatContext';
import { useComponentContext } from '../../context/ComponentContext';
import { MessageContextValue, useMessageContext } from '../../context/MessageContext';

import type { MessageUIComponentProps } from './types';

import type { DefaultOneChatGenerics } from '../../types';

type MessageSimpleWithContextProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = MessageContextValue<OneChatGenerics>;

const MessageSimpleWithContext = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: MessageSimpleWithContextProps<OneChatGenerics>,
) => {
  const {
    autoscrollToBottom,
    additionalMessageInputProps,
    clearEditingState,
    editing,
    endOfGroup,
    firstOfGroup,
    groupedByUser,
    handleAction,
    handleOpenThread,
    handleRetry,
    highlighted,
    isMyMessage,
    isReactionEnabled,
    message,
    onUserClick,
    onUserHover,
    reactionSelectorRef,
    renderText,
    showDetailedReactions,
    showName,
    threadList,
  } = props;

  const {
    Attachment,
    Avatar = DefaultAvatar,
    EditMessageInput = DefaultEditMessageForm,
    MessageDeleted = DefaultMessageDeleted,
    MessageOptions = DefaultMessageOptions,
    MessageRepliesCountButton = DefaultMessageRepliesCountButton,
    MessageStatus = DefaultMessageStatus,
    MessageTimestamp = DefaultMessageTimestamp,
    ReactionSelector = DefaultReactionSelector,
    ReactionsList = DefaultReactionList,
  } = useComponentContext<OneChatGenerics>('MessageSimple');
  const { themeVersion } = useChatContext('MessageSimple');

  const hasAttachment = messageHasAttachments(message);
  const hasReactions = messageHasReactions(message);

  if (message.customType === CUSTOM_MESSAGE_TYPE.date) {
    return null;
  }

  if (message.deleted_at || message.type === 'deleted') {
    return <MessageDeleted message={message} />;
  }

  const showMetadata = !groupedByUser || endOfGroup;
  const showReplyCountButton = !threadList && !!message.reply_count;
  const allowRetry = message.status === 'failed' && message.errorStatusCode !== 403;

  const rootClassName = clsx(
    'str-chat__message str-chat__message-simple',
    `str-chat__message--${message.type}`,
    `str-chat__message--${message.status}`,
    isMyMessage()
      ? 'str-chat__message--me str-chat__message-simple--me'
      : 'str-chat__message--other',
    message.text ? 'str-chat__message--has-text' : 'has-no-text',
    {
      'pinned-message': message.pinned,
      'str-chat__message--has-attachment': hasAttachment,
      'str-chat__message--highlighted': highlighted,
      'str-chat__message--with-reactions str-chat__message-with-thread-link':
        hasReactions && isReactionEnabled,
      'str-chat__message-send-can-be-retried':
        message?.status === 'failed' && message?.errorStatusCode !== 403,
      'str-chat__virtual-message__wrapper--end': endOfGroup,
      'str-chat__virtual-message__wrapper--first': firstOfGroup,
      'str-chat__virtual-message__wrapper--group': groupedByUser,
    },
  );

  // iframely、markdown、图片懒加载等都可能导致消息气泡大小发生变化
  // 这里监听气泡大小变化以后，调整位置自动滑动到底部
  const onResize = useCallback(() => autoscrollToBottom?.(), [autoscrollToBottom]);

  const { ref } = useResizeObserver<HTMLDivElement>({ onResize });

  return (
    <>
      {editing && (
        <Modal onClose={clearEditingState} open={editing}>
          <MessageInput
            clearEditingState={clearEditingState}
            grow
            Input={EditMessageInput}
            message={message}
            {...additionalMessageInputProps}
          />
        </Modal>
      )}
      {
        <div ref={ref} className={rootClassName} key={message.id}>
          {themeVersion === '1' && <MessageStatus />}
          {message.user && (
            <Avatar
              image={message.user.image}
              name={message.user.name || message.user.id}
              onClick={onUserClick}
              onMouseOver={onUserHover}
              user={message.user}
            />
          )}
          <div
            className={clsx('str-chat__message-inner', {
              'str-chat__simple-message--error-failed': allowRetry,
            })}
            data-testid='message-inner'
            onClick={allowRetry ? () => handleRetry(message) : undefined}
            onKeyUp={allowRetry ? () => handleRetry(message) : undefined}
          >
            <MessageOptions />
            <div className='str-chat__message-reactions-host'>
              {hasReactions && isReactionEnabled && <ReactionsList reverse />}
              {showDetailedReactions && isReactionEnabled && (
                <ReactionSelector ref={reactionSelectorRef} />
              )}
            </div>
            <div className='str-chat__message-bubble'>
              {message.attachments?.length && !message.quoted_message ? (
                <Attachment actionHandler={handleAction} attachments={message.attachments} />
              ) : null}
              <MessageText message={message} renderText={renderText} />
              {message.mml && (
                <MML
                  actionHandler={handleAction}
                  align={isMyMessage() ? 'right' : 'left'}
                  source={message.mml}
                />
              )}
              {themeVersion === '2' && <MessageErrorIcon />}
            </div>
            {showReplyCountButton && themeVersion === '1' && (
              <MessageRepliesCountButton
                onClick={handleOpenThread}
                reply_count={message.reply_count}
              />
            )}
            {showMetadata && themeVersion === '1' && (
              <div className='str-chat__message-data str-chat__message-simple-data'>
                {!isMyMessage() && message.user && showName ? (
                  <span className='str-chat__message-simple-name'>
                    {message.user.name || message.user.id}
                  </span>
                ) : null}
                <MessageTimestamp calendar customClass='str-chat__message-simple-timestamp' />
              </div>
            )}
          </div>
          {showReplyCountButton && themeVersion === '2' && (
            <MessageRepliesCountButton
              onClick={handleOpenThread}
              reply_count={message.reply_count}
            />
          )}
          {showMetadata && themeVersion === '2' && (
            <div className='str-chat__message-data str-chat__message-simple-data str-chat__message-metadata'>
              <MessageStatus />
              {!isMyMessage() && !!message.user && showName && (
                <span className='str-chat__message-simple-name'>
                  {message.user.name || message.user.id}
                </span>
              )}
              <MessageTimestamp calendar customClass='str-chat__message-simple-timestamp' />
            </div>
          )}
        </div>
      }
    </>
  );
};

const MemoizedMessageSimple = React.memo(
  MessageSimpleWithContext,
  areMessageUIPropsEqual,
) as typeof MessageSimpleWithContext;

/**
 * The default UI component that renders a message and receives functionality and logic from the MessageContext.
 */
export const MessageSimple = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: MessageUIComponentProps<OneChatGenerics>,
) => {
  const messageContext = useMessageContext<OneChatGenerics>('MessageSimple');

  return <MemoizedMessageSimple {...messageContext} {...props} />;
};
