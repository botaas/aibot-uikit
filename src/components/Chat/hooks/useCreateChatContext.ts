import { useMemo } from 'react';

import type { ChatContextValue } from '../../../context/ChatContext';
import type { DefaultOneChatGenerics } from '../../../types';

export const useCreateChatContext = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  value: ChatContextValue<OneChatGenerics>,
) => {
  const {
    channel,
    channelsQueryState,
    client,
    closeMobileNav,
    customClasses,
    getAppSettings,
    latestMessageDatesByChannels,
    mutes,
    navOpen,
    openMobileNav,
    setActiveChannel,
    theme,
    themeVersion,
    useImageFlagEmojisOnWindows,
  } = value;

  const channelCid = channel?.cid;
  const channelsQueryError = channelsQueryState.error;
  const channelsQueryInProgress = channelsQueryState.queryInProgress;
  const clientValues = `${client.hash()}`;
  const mutedUsersLength = mutes.length;

  const chatContext: ChatContextValue<OneChatGenerics> = useMemo(
    () => ({
      channel,
      channelsQueryState,
      client,
      closeMobileNav,
      customClasses,
      getAppSettings,
      latestMessageDatesByChannels,
      mutes,
      navOpen,
      openMobileNav,
      setActiveChannel,
      theme,
      themeVersion,
      useImageFlagEmojisOnWindows,
    }),
    [
      channelCid,
      channelsQueryError,
      channelsQueryInProgress,
      clientValues,
      getAppSettings,
      mutedUsersLength,
      navOpen,
    ],
  );

  return chatContext;
};
