import { CommandItem } from '../../CommandItem/CommandItem';

import { useChannelStateContext } from '../../../context/ChannelStateContext';
import { useChatContext } from '../../../context/ChatContext';

import type { CommandTriggerSetting } from '../DefaultTriggerProvider';

import type { CommandResponse, DefaultOneChatGenerics } from '../../../types';

export const useCommandTrigger = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(): CommandTriggerSetting<OneChatGenerics> => {
  const { themeVersion } = useChatContext<OneChatGenerics>('useCommandTrigger');
  const { channelConfig } = useChannelStateContext<OneChatGenerics>('useCommandTrigger');

  const commands = channelConfig?.commands;

  return {
    component: CommandItem,
    dataProvider: (query, text, onReady) => {
      if (text.indexOf('/') !== 0 || !commands) {
        return [];
      }
      const selectedCommands = commands.filter((command) => command.name?.indexOf(query) !== -1);

      // sort alphabetically unless the you're matching the first char
      selectedCommands.sort((a, b) => {
        let nameA = a.name?.toLowerCase();
        let nameB = b.name?.toLowerCase();
        if (nameA?.indexOf(query) === 0) {
          nameA = `0${nameA}`;
        }
        if (nameB?.indexOf(query) === 0) {
          nameB = `0${nameB}`;
        }
        // Should confirm possible null / undefined when TS is fully implemented
        if (nameA != null && nameB != null) {
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
        }

        return 0;
      });

      const result = selectedCommands.slice(0, themeVersion === '2' ? 5 : 10);
      if (onReady)
        onReady(
          result.filter(
            (result): result is CommandResponse<OneChatGenerics> & { name: string } =>
              result.name !== undefined,
          ),
          query,
        );

      return result;
    },
    output: (entity) => ({
      caretPosition: 'next',
      key: entity.name,
      text: `/${entity.name}`,
    }),
  };
};
