import { useMemo } from 'react';

import type { TypingContextValue } from '../../../context/TypingContext';
import type { DefaultOneChatGenerics } from '../../../types';

export const useCreateTypingContext = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  value: TypingContextValue<OneChatGenerics>,
) => {
  const { typing } = value;

  const typingValue = Object.keys(typing || {}).join();

  const typingContext: TypingContextValue<OneChatGenerics> = useMemo(
    () => ({
      typing,
    }),
    [typingValue],
  );

  return typingContext;
};
