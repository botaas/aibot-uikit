import { useMemo } from 'react';

import type { MessageInputContextValue } from '../../../context/MessageInputContext';
import type { CustomTrigger, DefaultOneChatGenerics } from '../../../types';

export const useCreateMessageInputContext = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics,
  V extends CustomTrigger = CustomTrigger
>(
  value: MessageInputContextValue<OneChatGenerics, V>,
) => {
  const {
    additionalTextareaProps,
    attachments,
    autocompleteTriggers,
    clearEditingState,
    closeCommandsList,
    closeEmojiPicker,
    closeMentionsList,
    cooldownInterval,
    cooldownRemaining,
    disabled,
    disableMentions,
    doFileUploadRequest,
    doImageUploadRequest,
    emojiIndex,
    emojiPickerIsOpen,
    emojiPickerRef,
    errorHandler,
    fileOrder,
    fileUploads,
    focus,
    grow,
    voice,
    maxVoiceDuration = 60,
    voiceInputIsEnabled,
    enableVoiceInput,
    disableVoiceInput,
    startRecordingVoice,
    stopRecordingVoice,
    isRecordingVoice,
    handleChange,
    handleEmojiKeyDown,
    handleSubmit,
    imageOrder,
    imageUploads,
    insertText,
    isUploadEnabled,
    maxFilesLeft,
    maxRows,
    mentionAllAppUsers,
    mentioned_users,
    mentionQueryParams,
    message,
    noFiles,
    numberOfUploads,
    onPaste,
    onSelectEmoji,
    onSelectUser,
    openCommandsList,
    openEmojiPicker,
    openMentionsList,
    overrideSubmitHandler,
    parent,
    publishTypingEvent,
    removeFile,
    removeImage,
    setCooldownRemaining,
    setText,
    shouldSubmit,
    showCommandsList,
    showMentionsList,
    text,
    textareaRef,
    uploadFile,
    uploadImage,
    uploadNewFiles,
    useMentionsTransliteration,
  } = value;

  const editing = message?.editing;
  const fileUploadsValue = Object.entries(fileUploads)
    // eslint-disable-next-line
    .map(([_, value]) => value.state)
    .join();
  const imageUploadsValue = Object.entries(imageUploads)
    // eslint-disable-next-line
    .map(([_, value]) => value.state)
    .join();
  const mentionedUsersLength = mentioned_users.length;
  const parentId = parent?.id;

  const messageInputContext: MessageInputContextValue<OneChatGenerics, V> = useMemo(
    () => ({
      additionalTextareaProps,
      attachments,
      autocompleteTriggers,
      clearEditingState,
      closeCommandsList,
      closeEmojiPicker,
      closeMentionsList,
      cooldownInterval,
      cooldownRemaining,
      disabled,
      disableMentions,
      doFileUploadRequest,
      doImageUploadRequest,
      emojiIndex,
      emojiPickerIsOpen,
      emojiPickerRef,
      errorHandler,
      fileOrder,
      fileUploads,
      focus,
      grow,
      voice,
      maxVoiceDuration,
      voiceInputIsEnabled,
      startRecordingVoice,
      stopRecordingVoice,
      isRecordingVoice,
      enableVoiceInput,
      disableVoiceInput,
      handleChange,
      handleEmojiKeyDown,
      handleSubmit,
      imageOrder,
      imageUploads,
      insertText,
      isUploadEnabled,
      maxFilesLeft,
      maxRows,
      mentionAllAppUsers,
      mentioned_users,
      mentionQueryParams,
      message,
      noFiles,
      numberOfUploads,
      onPaste,
      onSelectEmoji,
      onSelectUser,
      openCommandsList,
      openEmojiPicker,
      openMentionsList,
      overrideSubmitHandler,
      parent,
      publishTypingEvent,
      removeFile,
      removeImage,
      setCooldownRemaining,
      setText,
      shouldSubmit,
      showCommandsList,
      showMentionsList,
      text,
      textareaRef,
      uploadFile,
      uploadImage,
      uploadNewFiles,
      useMentionsTransliteration,
    }),
    [
      cooldownInterval,
      cooldownRemaining,
      editing,
      emojiPickerIsOpen,
      voiceInputIsEnabled,
      disableVoiceInput,
      startRecordingVoice,
      stopRecordingVoice,
      fileUploadsValue,
      imageUploadsValue,
      isUploadEnabled,
      mentionedUsersLength,
      parentId,
      publishTypingEvent,
      showCommandsList,
      showMentionsList,
      text,
      handleSubmit,
    ],
  );

  return messageInputContext;
};
