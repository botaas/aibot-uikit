import React, { useCallback } from 'react';

import type { DefaultOneChatGenerics, UserResponse } from '../../../types';

export type OnMentionAction<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = (event: React.BaseSyntheticEvent, user?: UserResponse<OneChatGenerics>) => void;

export const useMentionsHandlers = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  onMentionsHover?: OnMentionAction<OneChatGenerics>,
  onMentionsClick?: OnMentionAction<OneChatGenerics>,
) =>
  useCallback(
    (event: React.BaseSyntheticEvent, mentioned_users: UserResponse<OneChatGenerics>[]) => {
      if ((!onMentionsHover && !onMentionsClick) || !(event.target instanceof HTMLElement)) {
        return;
      }

      const target = event.target;
      const textContent = target.innerHTML.replace('*', '');

      if (textContent[0] === '@') {
        const userName = textContent.replace('@', '');
        const user = mentioned_users?.find(({ id, name }) => name === userName || id === userName);

        if (
          onMentionsHover &&
          typeof onMentionsHover === 'function' &&
          event.type === 'mouseover'
        ) {
          onMentionsHover(event, user);
        }

        if (onMentionsClick && event.type === 'click' && typeof onMentionsClick === 'function') {
          onMentionsClick(event, user);
        }
      }
    },
    [onMentionsClick, onMentionsHover],
  );
