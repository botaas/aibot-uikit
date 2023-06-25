import React, { useEffect, useMemo, useState } from 'react';

import { useChatContext } from '../../../context/ChatContext';
import { useChannelStateContext } from '../../../context/ChannelStateContext';

import type { ChannelResponse, DefaultOneChatGenerics } from '../../../types';

export type CooldownTimerState = {
  cooldownInterval: number;
  setCooldownRemaining: React.Dispatch<React.SetStateAction<number | undefined>>;
  cooldownRemaining?: number;
};

export const useCooldownTimer = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(): CooldownTimerState => {
  const { latestMessageDatesByChannels } = useChatContext<OneChatGenerics>('useCooldownTimer');
  const { channel, messages = [] } = useChannelStateContext<OneChatGenerics>('useCooldownTimer');
  const { client } = useChatContext<OneChatGenerics>('useCooldownTimer');
  const [cooldownRemaining, setCooldownRemaining] = useState<number>();

  const { cooldown: cooldownInterval, own_capabilities } = (channel.data ||
    {}) as ChannelResponse<OneChatGenerics>;

  const skipCooldown = !own_capabilities?.includes('slow-mode');

  const ownLatestMessageDate = useMemo(
    () =>
      latestMessageDatesByChannels[channel.cid] ??
      [...messages]
        .sort((a, b) => (b.created_at as Date)?.getTime() - (a.created_at as Date)?.getTime())
        .find((v) => v.user?.id === client.user?.id)?.created_at,
    [messages, client.user?.id, latestMessageDatesByChannels, channel.cid],
  ) as Date;

  useEffect(() => {
    if (skipCooldown || !cooldownInterval || !ownLatestMessageDate) return;

    const remainingCooldown = Math.round(
      cooldownInterval - (new Date().getTime() - ownLatestMessageDate.getTime()) / 1000,
    );

    if (remainingCooldown > 0) setCooldownRemaining(remainingCooldown);
  }, [cooldownInterval, ownLatestMessageDate, skipCooldown]);

  return {
    cooldownInterval: cooldownInterval ?? 0,
    cooldownRemaining,
    setCooldownRemaining,
  };
};
