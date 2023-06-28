import { useMemo } from 'react';

import { getReadStates } from '../utils';

import type { OneChatMessage } from '../../../context/ChannelStateContext';

import type { DefaultOneChatGenerics, UserResponse } from '../../../types';

type UseLastReadDataParams<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  messages: OneChatMessage<OneChatGenerics>[];
  returnAllReadData: boolean;
  userID: string | undefined;
  read?: Record<string, { last_read: Date; user: UserResponse<OneChatGenerics> }>;
};

export const useLastReadData = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: UseLastReadDataParams<OneChatGenerics>,
) => {
  const { messages, read, returnAllReadData, userID } = props;

  return useMemo(
    () =>
      getReadStates(
        messages.filter(({ user }) => user?.id === userID),
        read,
        returnAllReadData,
      ),
    [messages, read, returnAllReadData, userID],
  );
};
