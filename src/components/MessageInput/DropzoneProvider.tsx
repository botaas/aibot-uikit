import React, { PropsWithChildren } from 'react';
import { ImageDropzone } from 'react-file-utils';

import { useCooldownTimer } from './hooks/useCooldownTimer';
import { useCreateMessageInputContext } from './hooks/useCreateMessageInputContext';
import { useMessageInputState } from './hooks/useMessageInputState';

import { useChannelStateContext } from '../../context/ChannelStateContext';
import {
  MessageInputContextProvider,
  useMessageInputContext,
} from '../../context/MessageInputContext';

import type { MessageInputProps } from './MessageInput';

import type { CustomTrigger, DefaultOneChatGenerics, UnknownType } from '../../types';

const DropzoneInner = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics,
  V extends CustomTrigger = CustomTrigger
>({
  children,
}: PropsWithChildren<UnknownType>) => {
  const { acceptedFiles, multipleUploads } = useChannelStateContext<OneChatGenerics>(
    'DropzoneProvider',
  );

  const {
    cooldownRemaining,
    isUploadEnabled,
    maxFilesLeft,
    uploadNewFiles,
  } = useMessageInputContext<OneChatGenerics, V>('DropzoneProvider');

  return (
    <ImageDropzone
      accept={acceptedFiles}
      disabled={!isUploadEnabled || maxFilesLeft === 0 || !!cooldownRemaining}
      handleFiles={uploadNewFiles}
      maxNumberOfFiles={maxFilesLeft}
      multiple={multipleUploads}
    >
      {children}
    </ImageDropzone>
  );
};

export const DropzoneProvider = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics,
  V extends CustomTrigger = CustomTrigger
>(
  props: PropsWithChildren<MessageInputProps<OneChatGenerics, V>>,
) => {
  const cooldownTimerState = useCooldownTimer<OneChatGenerics>();
  const messageInputState = useMessageInputState<OneChatGenerics, V>(props);

  const messageInputContextValue = useCreateMessageInputContext<OneChatGenerics, V>({
    ...cooldownTimerState,
    ...messageInputState,
    ...props,
  });

  return (
    <MessageInputContextProvider value={messageInputContextValue}>
      <DropzoneInner>{props.children}</DropzoneInner>
    </MessageInputContextProvider>
  );
};
