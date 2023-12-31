import React from 'react';

import ReactMarkdown from 'react-markdown';

import type { TranslationContextValue } from '../../context/TranslationContext';

import type {
  Channel,
  DefaultOneChatGenerics,
  TranslationLanguages,
  UserResponse,
} from '../../types';

export const renderPreviewText = (text: string) => <ReactMarkdown skipHtml>{text}</ReactMarkdown>;

export const getLatestMessagePreview = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  channel: Channel<OneChatGenerics>,
  t: TranslationContextValue['t'],
  userLanguage: TranslationContextValue['userLanguage'] = 'en',
): string | JSX.Element => {
  const latestMessage = channel.state.messages[channel.state.messages.length - 1];

  const previewTextToRender =
    latestMessage?.i18n?.[`${userLanguage}_text` as `${TranslationLanguages}_text`] ||
    latestMessage?.text;

  if (!latestMessage) {
    return t('Nothing yet...');
  }

  if (latestMessage.deleted_at) {
    return t('Message deleted');
  }

  if (previewTextToRender) {
    const renderedText = renderPreviewText(previewTextToRender);
    return renderedText;
  }

  if (latestMessage.command) {
    return `/${latestMessage.command}`;
  }

  if (latestMessage.attachments?.length) {
    return t('🏙 Attachment...');
  }

  return t('Empty message...');
};

export const getDisplayTitle = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  channel: Channel<OneChatGenerics>,
  currentUser?: UserResponse<OneChatGenerics>,
) => {
  let title = channel.data?.name;
  const members = Object.values(channel.state.members);

  if (!title && members.length === 2) {
    const otherMember = members.find((member) => member.user?.id !== currentUser?.id);
    if (otherMember?.user?.name) {
      title = otherMember.user.name;
    }
  }

  return title;
};

export const getDisplayImage = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  channel: Channel<OneChatGenerics>,
  currentUser?: UserResponse<OneChatGenerics>,
) => {
  let image = channel.data?.image;
  const members = Object.values(channel.state.members);

  if (!image && members.length === 2) {
    const otherMember = members.find((member) => member.user?.id !== currentUser?.id);
    if (otherMember?.user?.image) {
      image = otherMember.user.image;
    }
  }

  return image;
};
