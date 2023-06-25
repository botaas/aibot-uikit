import React, { PropsWithChildren, useContext } from 'react';

import type { ChannelState as OneChatChannelState, DefaultOneChatGenerics, UnknownType } from '../types';

export type TypingContextValue<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  typing?: OneChatChannelState<OneChatGenerics>['typing'];
};

export const TypingContext = React.createContext<TypingContextValue | undefined>(undefined);

export const TypingProvider = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>({
  children,
  value,
}: PropsWithChildren<{
  value: TypingContextValue<OneChatGenerics>;
}>) => (
  <TypingContext.Provider value={(value as unknown) as TypingContextValue}>
    {children}
  </TypingContext.Provider>
);

export const useTypingContext = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  componentName?: string,
) => {
  const contextValue = useContext(TypingContext);

  if (!contextValue) {
    console.warn(
      `The useTypingContext hook was called outside of the TypingContext provider. Make sure this hook is called within a child of the Channel component. The errored call is located in the ${componentName} component.`,
    );

    return {} as TypingContextValue<OneChatGenerics>;
  }

  return contextValue as TypingContextValue<OneChatGenerics>;
};

/**
 * Typescript currently does not support partial inference, so if TypingContext
 * typing is desired while using the HOC withTypingContext, the Props for the
 * wrapped component must be provided as the first generic.
 */
export const withTypingContext = <
  P extends UnknownType,
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  Component: React.ComponentType<P>,
) => {
  const WithTypingContextComponent = (
    props: Omit<P, keyof TypingContextValue<OneChatGenerics>>,
  ) => {
    const typingContext = useTypingContext<OneChatGenerics>();

    return <Component {...(props as P)} {...typingContext} />;
  };

  WithTypingContextComponent.displayName = (
    Component.displayName ||
    Component.name ||
    'Component'
  ).replace('Base', '');

  return WithTypingContextComponent;
};
