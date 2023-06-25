
import type { ReactEventHandler } from '../types';

import type { OneChatMessage } from '../../../context/ChannelStateContext';

import type { User, DefaultOneChatGenerics } from '../../../types';

export type UserEventHandler<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = (event: React.BaseSyntheticEvent, user: User<OneChatGenerics>) => void;

export const useUserHandler = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  message?: OneChatMessage<OneChatGenerics>,
  eventHandlers?: {
    onUserClickHandler?: UserEventHandler<OneChatGenerics>;
    onUserHoverHandler?: UserEventHandler<OneChatGenerics>;
  },
): {
  onUserClick: ReactEventHandler;
  onUserHover: ReactEventHandler;
} => ({
  onUserClick: (event) => {
    if (typeof eventHandlers?.onUserClickHandler !== 'function' || !message?.user) {
      return;
    }
    eventHandlers.onUserClickHandler(event, message.user);
  },
  onUserHover: (event) => {
    if (typeof eventHandlers?.onUserHoverHandler !== 'function' || !message?.user) {
      return;
    }

    eventHandlers.onUserHoverHandler(event, message.user);
  },
});
