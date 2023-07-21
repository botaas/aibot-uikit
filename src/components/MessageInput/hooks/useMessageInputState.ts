import React, { Reducer, useCallback, useReducer, useState } from 'react';
import { nanoid } from 'nanoid';

import { OneChatMessage, useChannelStateContext } from '../../../context/ChannelStateContext';

import { useEmojiIndex } from './useEmojiIndex';
import { useAttachments } from './useAttachments';
import { useMessageInputText } from './useMessageInputText';
import { useEmojiPicker } from './useEmojiPicker';
import { useSubmitHandler } from './useSubmitHandler';
import { usePasteHandler } from './usePasteHandler';
import { useVoiceInput } from './useVoiceInput';

import type { EmojiData, NimbleEmojiIndex } from 'emoji-mart';
import type { FileLike } from 'react-file-utils';

import type { MessageInputProps } from '../MessageInput';

import type {
  Attachment,
  CustomTrigger,
  DefaultOneChatGenerics,
  Message,
  UserResponse,
} from '../../../types';

export type FileUpload = {
  file: {
    name: string;
    lastModified?: number;
    lastModifiedDate?: Date;
    size?: number;
    type?: string;
    uri?: string;
  };
  id: string;
  state: 'finished' | 'failed' | 'uploading';
  thumb_url?: string;
  url?: string;
};

export type ImageUpload<OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics> = {
  file: {
    name: string;
    height?: number;
    lastModified?: number;
    lastModifiedDate?: Date;
    size?: number;
    type?: string;
    uri?: string;
    width?: number;
  };
  id: string;
  state: 'finished' | 'failed' | 'uploading';
  previewUri?: string;
  url?: string;
} & Pick<
  Attachment<OneChatGenerics>,
  'og_scrape_url' | 'title' | 'title_link' | 'author_name' | 'text'
>;

export type MessageInputState<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  attachments: Attachment<OneChatGenerics>[];
  emojiPickerIsOpen: boolean;
  fileOrder: string[];
  fileUploads: Record<string, FileUpload>;
  imageOrder: string[];
  imageUploads: Record<string, ImageUpload>;
  mentioned_users: UserResponse<OneChatGenerics>[];
  setText: (text: string) => void;
  text: string;
  voiceInputIsEnabled: boolean;
};

type SetEmojiPickerIsOpenAction = {
  type: 'setEmojiPickerIsOpen';
  value: boolean;
};

type SetTextAction = {
  getNewText: (currentStateText: string) => string;
  type: 'setText';
};

type ClearAction = {
  type: 'clear';
};

type SetImageUploadAction = {
  id: string;
  type: 'setImageUpload';
  file?: File | FileLike;
  previewUri?: string;
  state?: string;
  url?: string;
};

type SetFileUploadAction = {
  id: string;
  type: 'setFileUpload';
  file?: File;
  state?: string;
  thumb_url?: string;
  url?: string;
};

type RemoveImageUploadAction = {
  id: string;
  type: 'removeImageUpload';
};

type RemoveFileUploadAction = {
  id: string;
  type: 'removeFileUpload';
};

type AddMentionedUserAction<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  type: 'addMentionedUser';
  user: UserResponse<OneChatGenerics>;
};

type SetVoiceInputIsEnabledAction = {
  type: 'setVoiceInputIsEnabled';
  value: boolean;
};

export type MessageInputReducerAction<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> =
  | SetEmojiPickerIsOpenAction
  | SetTextAction
  | ClearAction
  | SetImageUploadAction
  | SetFileUploadAction
  | RemoveImageUploadAction
  | RemoveFileUploadAction
  | AddMentionedUserAction<OneChatGenerics>
  | SetVoiceInputIsEnabledAction;

export type MessageInputHookProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  closeEmojiPicker: React.MouseEventHandler<HTMLElement>;
  emojiPickerRef: React.MutableRefObject<HTMLDivElement | null>;
  handleChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  handleEmojiKeyDown: React.KeyboardEventHandler<HTMLSpanElement>;
  handleSubmit: (
    event: React.BaseSyntheticEvent,
    customMessageData?: Partial<Message<OneChatGenerics>>,
  ) => void;
  insertText: (textToInsert: string) => void;
  isUploadEnabled: boolean;
  maxFilesLeft: number;
  numberOfUploads: number;
  onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onSelectEmoji: (emoji: EmojiData) => void;
  onSelectUser: (item: UserResponse<OneChatGenerics>) => void;
  openEmojiPicker: React.MouseEventHandler<HTMLSpanElement>;
  removeFile: (id: string) => void;
  removeImage: (id: string) => void;
  textareaRef: React.MutableRefObject<HTMLTextAreaElement | null | undefined>;
  uploadFile: (id: string) => void;
  uploadImage: (id: string) => void;
  uploadNewFiles: (files: FileList | File[]) => void;
  emojiIndex?: NimbleEmojiIndex;
  enableVoiceInput: React.MouseEventHandler<HTMLElement>;
  disableVoiceInput: React.MouseEventHandler<HTMLElement>;
  startRecordingVoice: React.MouseEventHandler<HTMLElement>;
  stopRecordingVoice: React.MouseEventHandler<HTMLElement>;
  isRecordingVoice: boolean;
};

const makeEmptyMessageInputState = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(): MessageInputState<OneChatGenerics> => ({
  attachments: [],
  emojiPickerIsOpen: false,
  fileOrder: [],
  fileUploads: {},
  imageOrder: [],
  imageUploads: {},
  mentioned_users: [],
  setText: () => null,
  text: '',
  voiceInputIsEnabled: false,
});

/**
 * Initializes the state. Empty if the message prop is falsy.
 */
const initState = <OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics>(
  message?: Pick<OneChatMessage<OneChatGenerics>, 'attachments' | 'mentioned_users' | 'text'>,
): MessageInputState<OneChatGenerics> => {
  if (!message) {
    return makeEmptyMessageInputState();
  }

  // if message prop is defined, get image uploads, file uploads, text, etc.
  const imageUploads =
    message.attachments
      ?.filter(({ type }) => type === 'image')
      .reduce<Record<string, ImageUpload>>(
        (
          acc,
          { author_name, fallback = '', image_url, og_scrape_url, text, title, title_link },
        ) => {
          const id = nanoid();
          acc[id] = {
            author_name,
            file: {
              name: fallback,
            },
            id,
            og_scrape_url,
            state: 'finished',
            text,
            title,
            title_link,
            url: image_url,
          };
          return acc;
        },
        {},
      ) ?? {};

  const fileUploads =
    message.attachments
      ?.filter(({ type }) => type === 'file')
      .reduce<Record<string, FileUpload>>(
        (acc, { asset_url, file_size, mime_type, thumb_url, title = '' }) => {
          const id = nanoid();
          acc[id] = {
            file: {
              name: title,
              size: file_size,
              type: mime_type,
            },
            id,
            state: 'finished',
            thumb_url,
            url: asset_url,
          };
          return acc;
        },
        {},
      ) ?? {};

  const imageOrder = Object.keys(imageUploads);
  const fileOrder = Object.keys(fileUploads);

  const attachments =
    message.attachments?.filter(({ type }) => type !== 'file' && type !== 'image') || [];

  const mentioned_users: OneChatMessage['mentioned_users'] = message.mentioned_users || [];

  return {
    attachments,
    emojiPickerIsOpen: false,
    fileOrder,
    fileUploads,
    imageOrder,
    imageUploads,
    mentioned_users,
    setText: () => null,
    text: message.text || '',
    voiceInputIsEnabled: false,
  };
};

/**
 * MessageInput state reducer
 */
const messageInputReducer = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  state: MessageInputState<OneChatGenerics>,
  action: MessageInputReducerAction<OneChatGenerics>,
) => {
  switch (action.type) {
    case 'setEmojiPickerIsOpen':
      return { ...state, emojiPickerIsOpen: action.value };

    case 'setText':
      return { ...state, text: action.getNewText(state.text) };

    case 'clear':
      const { voiceInputIsEnabled } = state;
      return {
        ...makeEmptyMessageInputState(),
        // 保持语音输入方式
        voiceInputIsEnabled,
      };

    case 'setImageUpload': {
      const imageAlreadyExists = state.imageUploads[action.id];
      if (!imageAlreadyExists && !action.file) return state;
      const imageOrder = imageAlreadyExists ? state.imageOrder : state.imageOrder.concat(action.id);
      const newUploadFields = { ...action } as Partial<SetImageUploadAction>;
      delete newUploadFields.type;
      return {
        ...state,
        imageOrder,
        imageUploads: {
          ...state.imageUploads,
          [action.id]: { ...state.imageUploads[action.id], ...newUploadFields },
        },
      };
    }

    case 'setFileUpload': {
      const fileAlreadyExists = state.fileUploads[action.id];
      if (!fileAlreadyExists && !action.file) return state;
      const fileOrder = fileAlreadyExists ? state.fileOrder : state.fileOrder.concat(action.id);
      const newUploadFields = { ...action } as Partial<SetFileUploadAction>;
      delete newUploadFields.type;
      return {
        ...state,
        fileOrder,
        fileUploads: {
          ...state.fileUploads,
          [action.id]: { ...state.fileUploads[action.id], ...newUploadFields },
        },
      };
    }

    case 'removeImageUpload': {
      if (!state.imageUploads[action.id]) return state; // cannot remove anything
      const newImageUploads = { ...state.imageUploads };
      delete newImageUploads[action.id];
      return {
        ...state,
        imageOrder: state.imageOrder.filter((_id) => _id !== action.id),
        imageUploads: newImageUploads,
      };
    }

    case 'removeFileUpload': {
      if (!state.fileUploads[action.id]) return state; // cannot remove anything
      const newFileUploads = { ...state.fileUploads };
      delete newFileUploads[action.id];
      return {
        ...state,
        fileOrder: state.fileOrder.filter((_id) => _id !== action.id),
        fileUploads: newFileUploads,
      };
    }

    case 'addMentionedUser':
      return {
        ...state,
        mentioned_users: state.mentioned_users.concat(action.user),
      };

    case 'setVoiceInputIsEnabled':
      return { ...state, voiceInputIsEnabled: action.value };

    default:
      return state;
  }
};

export type CommandsListState = {
  closeCommandsList: () => void;
  openCommandsList: () => void;
  showCommandsList: boolean;
};

export type MentionsListState = {
  closeMentionsList: () => void;
  openMentionsList: () => void;
  showMentionsList: boolean;
};

/**
 * hook for MessageInput state
 */
export const useMessageInputState = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics,
  V extends CustomTrigger = CustomTrigger
>(
  props: MessageInputProps<OneChatGenerics, V>,
): MessageInputState<OneChatGenerics> &
  MessageInputHookProps<OneChatGenerics> &
  CommandsListState &
  MentionsListState => {
  const { additionalTextareaProps, closeEmojiPickerOnClick, getDefaultValue, message } = props;

  const { channelCapabilities = {}, channelConfig } = useChannelStateContext<OneChatGenerics>(
    'useMessageInputState',
  );

  const defaultValue = getDefaultValue?.() || additionalTextareaProps?.defaultValue;
  const initialStateValue =
    message ||
    ((Array.isArray(defaultValue)
      ? { text: defaultValue.join('') }
      : { text: defaultValue?.toString() }) as Partial<OneChatMessage<OneChatGenerics>>);

  const [state, dispatch] = useReducer(
    messageInputReducer as Reducer<
      MessageInputState<OneChatGenerics>,
      MessageInputReducerAction<OneChatGenerics>
    >,
    initialStateValue,
    initState,
  );

  const { handleChange, insertText, textareaRef } = useMessageInputText<OneChatGenerics, V>(
    props,
    state,
    dispatch,
  );

  const [showCommandsList, setShowCommandsList] = useState(false);
  const [showMentionsList, setShowMentionsList] = useState(false);

  const openCommandsList = () => {
    dispatch({
      getNewText: () => '/',
      type: 'setText',
    });
    setShowCommandsList(true);
  };

  const closeCommandsList = () => setShowCommandsList(false);

  const openMentionsList = () => {
    dispatch({
      getNewText: (currentText) => currentText + '@',
      type: 'setText',
    });
    setShowMentionsList(true);
  };

  const closeMentionsList = () => setShowMentionsList(false);

  const {
    closeEmojiPicker,
    emojiPickerRef,
    handleEmojiKeyDown,
    onSelectEmoji,
    openEmojiPicker,
  } = useEmojiPicker<OneChatGenerics>(
    state,
    dispatch,
    insertText,
    textareaRef,
    closeEmojiPickerOnClick,
  );

  const {
    maxFilesLeft,
    numberOfUploads,
    removeFile,
    removeImage,
    uploadFile,
    uploadImage,
    uploadNewFiles,
  } = useAttachments<OneChatGenerics, V>(props, state, dispatch, textareaRef);

  const { handleSubmit } = useSubmitHandler<OneChatGenerics, V>(
    props,
    state,
    dispatch,
    numberOfUploads,
  );
  const isUploadEnabled =
    channelConfig?.uploads !== false && channelCapabilities['upload-file'] !== false;

  const { onPaste } = usePasteHandler(uploadNewFiles, insertText, isUploadEnabled);

  const onSelectUser = useCallback((item: UserResponse<OneChatGenerics>) => {
    dispatch({ type: 'addMentionedUser', user: item });
  }, []);

  const setText = useCallback((text: string) => {
    dispatch({ getNewText: () => text, type: 'setText' });
  }, []);

  const {
    enableVoiceInput,
    disableVoiceInput,
    startRecordingVoice,
    stopRecordingVoice,
    isRecordingVoice,
  } = useVoiceInput(state, dispatch, uploadNewFiles, handleSubmit);

  return {
    ...state,
    closeCommandsList,
    /**
     * TODO: fix the below at some point because this type casting is wrong
     * and just forced to not have warnings currently with the unknown casting
     */
    closeEmojiPicker: (closeEmojiPicker as unknown) as React.MouseEventHandler<HTMLSpanElement>,
    closeMentionsList,
    emojiIndex: useEmojiIndex(),
    emojiPickerRef,
    handleChange,
    handleEmojiKeyDown,
    handleSubmit,
    insertText,
    isUploadEnabled,
    maxFilesLeft,
    numberOfUploads,
    onPaste,
    onSelectEmoji,
    onSelectUser,
    openCommandsList,
    openEmojiPicker,
    openMentionsList,
    removeFile,
    removeImage,
    setText,
    showCommandsList,
    showMentionsList,
    textareaRef,
    uploadFile,
    uploadImage,
    uploadNewFiles,
    enableVoiceInput: (enableVoiceInput as unknown) as React.MouseEventHandler<HTMLDivElement>,
    disableVoiceInput: (disableVoiceInput as unknown) as React.MouseEventHandler<HTMLDivElement>,
    startRecordingVoice: (startRecordingVoice as unknown) as React.MouseEventHandler<HTMLDivElement>,
    stopRecordingVoice: (stopRecordingVoice as unknown) as React.MouseEventHandler<HTMLDivElement>,
    isRecordingVoice,
  };
};
