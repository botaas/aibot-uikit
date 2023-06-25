import React from 'react';

import { Message } from '../Message/Message';

import type { OneChatMessage } from '../../context/ChannelStateContext';
import type { DefaultOneChatGenerics } from '../../types';

export type GiphyPreviewMessageProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  message: OneChatMessage<OneChatGenerics>;
};

export const GiphyPreviewMessage = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: GiphyPreviewMessageProps<OneChatGenerics>,
) => {
  const { message } = props;

  return (
    <div className='giphy-preview-message'>
      <Message message={message} />
    </div>
  );
};
