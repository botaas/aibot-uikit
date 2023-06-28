import { useCallback, useEffect, useRef } from 'react';
import type { MessageInputReducerAction, MessageInputState } from './useMessageInputState';
import type { MessageInputProps } from '../MessageInput';
import { useChannelStateContext } from '../../../context/ChannelStateContext';

import type { CustomTrigger, DefaultOneChatGenerics } from '../../../types';

export const useMessageInputText = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics,
  V extends CustomTrigger = CustomTrigger
>(
  props: MessageInputProps<OneChatGenerics, V>,
  state: MessageInputState<OneChatGenerics>,
  dispatch: React.Dispatch<MessageInputReducerAction<OneChatGenerics>>,
) => {
  const { channel } = useChannelStateContext<OneChatGenerics>('useMessageInputText');
  const { additionalTextareaProps, focus, parent, publishTypingEvent = true } = props;
  const { text } = state;

  const textareaRef = useRef<HTMLTextAreaElement>();

  // Focus
  useEffect(() => {
    if (focus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [focus]);

  // Text + cursor position
  const newCursorPosition = useRef<number>();

  const insertText = useCallback(
    (textToInsert: string) => {
      const { maxLength } = additionalTextareaProps || {};

      if (!textareaRef.current) {
        dispatch({
          getNewText: (text) => {
            const updatedText = text + textToInsert;
            if (maxLength && updatedText.length > maxLength) {
              return updatedText.slice(0, maxLength);
            }
            return updatedText;
          },
          type: 'setText',
        });
        return;
      }

      const { selectionEnd, selectionStart } = textareaRef.current;
      newCursorPosition.current = selectionStart + textToInsert.length;

      dispatch({
        getNewText: (prevText) => {
          const updatedText =
            prevText.slice(0, selectionStart) + textToInsert + prevText.slice(selectionEnd);

          if (maxLength && updatedText.length > maxLength) {
            return updatedText.slice(0, maxLength);
          }

          return updatedText;
        },
        type: 'setText',
      });
    },
    [additionalTextareaProps, newCursorPosition, textareaRef],
  );

  useEffect(() => {
    const textareaElement = textareaRef.current;
    if (textareaElement && newCursorPosition.current !== undefined) {
      textareaElement.selectionStart = newCursorPosition.current;
      textareaElement.selectionEnd = newCursorPosition.current;
      newCursorPosition.current = undefined;
    }
  }, [text, newCursorPosition]);

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      event.preventDefault();
      if (!event || !event.target) {
        return;
      }

      const newText = event.target.value;
      dispatch({
        getNewText: () => newText,
        type: 'setText',
      });
      if (publishTypingEvent && newText && channel) {
        channel.keystroke(parent?.id);
      }
    },
    [channel, parent, publishTypingEvent],
  );

  return {
    handleChange,
    insertText,
    textareaRef,
  };
};
