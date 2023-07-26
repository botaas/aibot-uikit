import React, { PropsWithChildren } from 'react';

import { DefaultTriggerProvider } from './DefaultTriggerProvider';
import { MessageInputFlat } from './MessageInputFlat';

import { useCooldownTimer } from './hooks/useCooldownTimer';
import { useCreateMessageInputContext } from './hooks/useCreateMessageInputContext';
import { FileUpload, ImageUpload, useMessageInputState } from './hooks/useMessageInputState';

import { OneChatMessage, useChannelStateContext } from '../../context/ChannelStateContext';
import { useComponentContext } from '../../context/ComponentContext';
import { MessageInputContextProvider } from '../../context/MessageInputContext';

import type { SearchQueryParams } from '../ChannelSearch/hooks/useChannelSearch';
import type { MessageToSend } from '../../context/ChannelActionContext';

import type {
  Channel,
  CustomTrigger,
  DefaultOneChatGenerics,
  Message,
  SendFileAPIResponse,
} from '../../types';

export type MessageInputProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics,
  V extends CustomTrigger = CustomTrigger
> = {
  /** Additional props to be passed to the underlying `AutoCompleteTextarea` component, [available props](https://www.npmjs.com/package/react-textarea-autosize) */
  additionalTextareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  /** Function to clear the editing state while editing a message */
  clearEditingState?: () => void;
  /** If true, picking an emoji from the `EmojiPicker` component will close the picker */
  closeEmojiPickerOnClick?: boolean;
  /** If true, disables the text input */
  disabled?: boolean;
  /** If true, the suggestion list will not display and autocomplete @mentions. Default: false. */
  disableMentions?: boolean;
  /** Function to override the default file upload request */
  doFileUploadRequest?: (
    file: FileUpload['file'],
    channel: Channel<OneChatGenerics>,
  ) => Promise<SendFileAPIResponse>;
  /** Function to override the default image upload request */
  doImageUploadRequest?: (
    file: ImageUpload['file'],
    channel: Channel<OneChatGenerics>,
  ) => Promise<SendFileAPIResponse>;
  /** Custom error handler function to be called with a file/image upload fails */
  errorHandler?: (
    error: Error,
    type: string,
    file: (FileUpload | ImageUpload)['file'] & { id?: string },
  ) => void;
  /** If true, focuses the text input on component mount */
  focus?: boolean;
  /** Generates the default value for the underlying textarea element. The function's return value takes precedence before additionalTextareaProps.defaultValue. */
  getDefaultValue?: () => string | string[];
  /** If true, expands the text input vertically for new lines */
  grow?: boolean;
  /** If true, enable voice input. Default: false */
  voice?: boolean;
  /** Max duration in seconds of the voice input. */
  maxVoiceDuration?: number;
  /** Custom UI component handling how the message input is rendered, defaults to and accepts the same props as [MessageInputFlat](https://github.com/botaas/aibot-uikit/blob/master/src/components/MessageInput/MessageInputFlat.tsx) */
  Input?: React.ComponentType<MessageInputProps<OneChatGenerics, V>>;
  /** Max number of rows the underlying `textarea` component is allowed to grow */
  maxRows?: number;
  /** If true, the suggestion list will search all app users for an @mention, not just current channel members/watchers. Default: false. */
  mentionAllAppUsers?: boolean;
  /** Object containing filters/sort/options overrides for an @mention user query */
  mentionQueryParams?: SearchQueryParams<OneChatGenerics>['userFilters'];
  /** If provided, the existing message will be edited on submit */
  message?: OneChatMessage<OneChatGenerics>;
  /** If true, disables file uploads for all attachments except for those with type 'image'. Default: false */
  noFiles?: boolean;
  /** Function to override the default submit handler */
  overrideSubmitHandler?: (
    message: MessageToSend<OneChatGenerics>,
    channelCid: string,
    customMessageData?: Partial<Message<OneChatGenerics>>,
  ) => Promise<void> | void;
  /** When replying in a thread, the parent message object */
  parent?: OneChatMessage<OneChatGenerics>;
  /** If true, triggers typing events on text input keystroke */
  publishTypingEvent?: boolean;
  /**
   * Currently, `Enter` is the default submission key and  `Shift`+`Enter` is the default combination for the new line.
   * If specified, this function overrides the default behavior specified previously.
   *
   * Example of default behaviour:
   * ```tsx
   * const defaultShouldSubmit = (event) => event.key === "Enter" && !event.shiftKey;
   * ```
   */
  shouldSubmit?: (event: KeyboardEvent) => boolean;
  useMentionsTransliteration?: boolean;
};

const MessageInputProvider = <
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
    <MessageInputContextProvider<OneChatGenerics, V> value={messageInputContextValue}>
      {props.children}
    </MessageInputContextProvider>
  );
};

const UnMemoizedMessageInput = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics,
  V extends CustomTrigger = CustomTrigger
>(
  props: MessageInputProps<OneChatGenerics, V>,
) => {
  const { Input: PropInput } = props;

  const { dragAndDropWindow } = useChannelStateContext<OneChatGenerics>();
  const { Input: ContextInput, TriggerProvider = DefaultTriggerProvider } = useComponentContext<
    OneChatGenerics,
    V
  >('MessageInput');

  const Input = PropInput || ContextInput || MessageInputFlat;

  if (dragAndDropWindow)
    return (
      <>
        <TriggerProvider>
          <Input />
        </TriggerProvider>
      </>
    );

  return (
    <MessageInputProvider {...props}>
      <TriggerProvider>
        <Input />
      </TriggerProvider>
    </MessageInputProvider>
  );
};

/**
 * A high level component that has provides all functionality to the Input it renders.
 */
export const MessageInput = React.memo(UnMemoizedMessageInput) as typeof UnMemoizedMessageInput;
