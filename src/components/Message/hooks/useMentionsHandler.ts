import { useChannelActionContext } from '../../../context/ChannelActionContext';

import type React from 'react';

import type { ReactEventHandler } from '../types';

import type { OneChatMessage } from '../../../context/ChannelStateContext';

import type { DefaultOneChatGenerics, UserResponse } from '../../../types';

export type CustomMentionHandler<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = (event: React.BaseSyntheticEvent, mentioned_users: UserResponse<OneChatGenerics>[]) => void;

export type MentionedUserEventHandler<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = (event: React.BaseSyntheticEvent, mentionedUsers: UserResponse<OneChatGenerics>[]) => void;

function createEventHandler<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  fn?: CustomMentionHandler<OneChatGenerics>,
  message?: OneChatMessage<OneChatGenerics>,
): ReactEventHandler {
  return (event) => {
    if (typeof fn !== 'function' || !message?.mentioned_users?.length) {
      return;
    }
    fn(event, message.mentioned_users);
  };
}

export const useMentionsHandler = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  message?: OneChatMessage<OneChatGenerics>,
  customMentionHandler?: {
    onMentionsClick?: CustomMentionHandler<OneChatGenerics>;
    onMentionsHover?: CustomMentionHandler<OneChatGenerics>;
  },
) => {
  const {
    onMentionsClick: contextOnMentionsClick,
    onMentionsHover: contextOnMentionsHover,
  } = useChannelActionContext<OneChatGenerics>('useMentionsHandler');

  const onMentionsClick =
    customMentionHandler?.onMentionsClick || contextOnMentionsClick || (() => null);

  const onMentionsHover =
    customMentionHandler?.onMentionsHover || contextOnMentionsHover || (() => null);

  return {
    onMentionsClick: createEventHandler(onMentionsClick, message),
    onMentionsHover: createEventHandler(onMentionsHover, message),
  };
};
