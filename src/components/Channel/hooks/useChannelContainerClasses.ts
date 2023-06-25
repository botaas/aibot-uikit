import type { ChatContextValue } from '../../../context/ChatContext';
import { useChatContext } from '../../../context/ChatContext';

import type { DefaultOneChatGenerics } from '../../../types';

export const useChannelContainerClasses = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>({
  customClasses,
}: Pick<ChatContextValue, 'customClasses'>) => {
  const { useImageFlagEmojisOnWindows } = useChatContext<OneChatGenerics>('Channel');

  return {
    channelClass: customClasses?.channel ?? 'str-chat-channel str-chat__channel',
    chatClass: customClasses?.chat ?? 'str-chat',
    chatContainerClass: customClasses?.chatContainer ?? 'str-chat__container',
    windowsEmojiClass:
      useImageFlagEmojisOnWindows && navigator.userAgent.match(/Win/)
        ? 'str-chat--windows-flags'
        : '',
  };
};
