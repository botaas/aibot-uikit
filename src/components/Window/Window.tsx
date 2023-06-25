import React, { PropsWithChildren } from 'react';
import clsx from 'clsx';

import { OneChatMessage, useChannelStateContext } from '../../context/ChannelStateContext';

import type { DefaultOneChatGenerics } from '../../types';

export type WindowProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  /** show or hide the window when a thread is active */
  hideOnThread?: boolean;
  /** optional prop to force addition of class str-chat__main-panel--hideOnThread to the Window root element */
  thread?: OneChatMessage<OneChatGenerics>;
};

const UnMemoizedWindow = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: PropsWithChildren<WindowProps<OneChatGenerics>>,
) => {
  const { children, hideOnThread = false, thread: propThread } = props;

  const { thread: contextThread } = useChannelStateContext<OneChatGenerics>('Window');

  return (
    <div
      className={clsx('str-chat__main-panel', {
        'str-chat__main-panel--hideOnThread': hideOnThread && (contextThread || propThread),
      })}
    >
      {children}
    </div>
  );
};

/**
 * A UI component for conditionally displaying a Thread or Channel
 */
export const Window = React.memo(UnMemoizedWindow) as typeof UnMemoizedWindow;
