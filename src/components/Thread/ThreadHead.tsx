import React from 'react';

import { Message, MessageProps } from '../Message';
import { ThreadStart as DefaultThreadStart } from './ThreadStart';

import { useComponentContext } from '../../context';

import type { DefaultOneChatGenerics } from '../../types';

export const ThreadHead = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: MessageProps<OneChatGenerics>,
) => {
  const { ThreadStart = DefaultThreadStart } = useComponentContext<OneChatGenerics>(
    'ThreadHead',
  );
  return (
    <div className='str-chat__parent-message-li'>
      <Message initialMessage threadList {...props} />
      <ThreadStart />
    </div>
  );
};
