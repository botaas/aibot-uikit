import { isUserMuted, validateAndGetMessage } from '../utils';

import { OneChatMessage, useChannelStateContext } from '../../../context/ChannelStateContext';
import { useChatContext } from '../../../context/ChatContext';
import { useTranslationContext } from '../../../context/TranslationContext';

import type { ReactEventHandler } from '../types';

import type { UserResponse, DefaultOneChatGenerics } from '../../../types';

export const missingUseMuteHandlerParamsWarning =
  'useMuteHandler was called but it is missing one or more necessary parameter.';

export type MuteUserNotifications<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  getErrorNotification?: (user: UserResponse<OneChatGenerics>) => string;
  getSuccessNotification?: (user: UserResponse<OneChatGenerics>) => string;
  notify?: (notificationText: string, type: 'success' | 'error') => void;
};

export const useMuteHandler = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  message?: OneChatMessage<OneChatGenerics>,
  notifications: MuteUserNotifications<OneChatGenerics> = {},
): ReactEventHandler => {
  const { mutes } = useChannelStateContext<OneChatGenerics>('useMuteHandler');
  const { client } = useChatContext<OneChatGenerics>('useMuteHandler');
  const { t } = useTranslationContext('useMuteHandler');

  return async (event) => {
    event.preventDefault();

    const { getErrorNotification, getSuccessNotification, notify } = notifications;

    if (!t || !message?.user || !notify || !client) {
      console.warn(missingUseMuteHandlerParamsWarning);
      return;
    }

    if (!isUserMuted(message, mutes)) {
      try {
        await client.muteUser(message.user.id);

        const successMessage =
          getSuccessNotification && validateAndGetMessage(getSuccessNotification, [message.user]);

        notify(
          successMessage ||
          t(`{{ user }} has been muted`, {
            user: message.user.name || message.user.id,
          }),
          'success',
        );
      } catch (e) {
        const errorMessage =
          getErrorNotification && validateAndGetMessage(getErrorNotification, [message.user]);

        notify(errorMessage || t('Error muting a user ...'), 'error');
      }
    } else {
      try {
        await client.unmuteUser(message.user.id);

        const fallbackMessage = t(`{{ user }} has been unmuted`, {
          user: message.user.name || message.user.id,
        });

        const successMessage =
          (getSuccessNotification &&
            validateAndGetMessage(getSuccessNotification, [message.user])) ||
          fallbackMessage;

        if (typeof successMessage === 'string') {
          notify(successMessage, 'success');
        }
      } catch (e) {
        const errorMessage =
          (getErrorNotification && validateAndGetMessage(getErrorNotification, [message.user])) ||
          t('Error unmuting a user ...');

        if (typeof errorMessage === 'string') {
          notify(errorMessage, 'error');
        }
      }
    }
  };
};
