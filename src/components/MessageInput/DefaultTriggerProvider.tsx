import React, { PropsWithChildren } from 'react';

import { useCommandTrigger } from './hooks/useCommandTrigger';
import { useEmojiTrigger } from './hooks/useEmojiTrigger';
import { useUserTrigger } from './hooks/useUserTrigger';

import {
  MessageInputContextProvider,
  useMessageInputContext,
} from '../../context/MessageInputContext';

import type { EmojiData } from 'emoji-mart';

import type { SuggestionCommand, SuggestionUser } from '../ChatAutoComplete/ChatAutoComplete';
import type { CommandItemProps } from '../CommandItem/CommandItem';
import type { EmoticonItemProps } from '../EmoticonItem/EmoticonItem';
import type { UserItemProps } from '../UserItem/UserItem';

import type { CustomTrigger, DefaultOneChatGenerics, UnknownType } from '../../types';

export type AutocompleteMinimalData = {
  id?: string;
  name?: string;
} & ({ id: string } | { name: string });

export type CommandTriggerSetting<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = TriggerSetting<CommandItemProps, SuggestionCommand<OneChatGenerics>>;

export type EmojiTriggerSetting = TriggerSetting<EmoticonItemProps, EmojiData>;

export type UserTriggerSetting<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = TriggerSetting<UserItemProps, SuggestionUser<OneChatGenerics>>;

export type TriggerSetting<T extends UnknownType = UnknownType, U = UnknownType> = {
  component: string | React.ComponentType<T>;
  dataProvider: (
    query: string,
    text: string,
    onReady: (data: (U & AutocompleteMinimalData)[], token: string) => void,
  ) => U[] | Promise<void> | void;
  output: (
    entity: U,
  ) =>
    | {
        caretPosition: 'start' | 'end' | 'next' | number;
        text: string;
        key?: string;
      }
    | string
    | null;
  callback?: (item: U) => void;
};

export type TriggerSettings<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics,
  V extends CustomTrigger = CustomTrigger
> =
  | {
      [key in keyof V]: TriggerSetting<V[key]['componentProps'], V[key]['data']>;
    }
  | {
      '/': CommandTriggerSetting<OneChatGenerics>;
      ':': EmojiTriggerSetting;
      '@': UserTriggerSetting<OneChatGenerics>;
    };

export const DefaultTriggerProvider = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics,
  V extends CustomTrigger = CustomTrigger
>({
  children,
}: PropsWithChildren<Record<string, unknown>>) => {
  const currentValue = useMessageInputContext<OneChatGenerics, V>('DefaultTriggerProvider');

  const defaultAutocompleteTriggers: TriggerSettings<OneChatGenerics> = {
    '/': useCommandTrigger<OneChatGenerics>(),
    ':': useEmojiTrigger(currentValue.emojiIndex),
    '@': useUserTrigger<OneChatGenerics>({
      disableMentions: currentValue.disableMentions,
      mentionAllAppUsers: currentValue.mentionAllAppUsers,
      mentionQueryParams: currentValue.mentionQueryParams,
      onSelectUser: currentValue.onSelectUser,
      useMentionsTransliteration: currentValue.useMentionsTransliteration,
    }),
  };

  const newValue = {
    ...currentValue,
    autocompleteTriggers: defaultAutocompleteTriggers,
  };

  return <MessageInputContextProvider value={newValue}>{children}</MessageInputContextProvider>;
};
