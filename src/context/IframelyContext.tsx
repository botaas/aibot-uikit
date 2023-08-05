import React, { PropsWithChildren, Reducer, useContext, useMemo, useReducer } from 'react';
import { getDisplayName } from './utils/getDisplayName';
import type { UnknownType } from '../types';

export type Iframely = {
  html?: string;
  mediaType?: string;
  error?: unknown;
};

type IframelyState = {
  iframes: Record<string, Iframely>;
};

type SetIframelyAction = {
  type: 'setIframely';
  value: {
    href: string;
    iframely: Iframely;
  };
};

type IframelyReducerAction = SetIframelyAction;

type IframelyReducer = Reducer<IframelyState, IframelyReducerAction>;

const iframelyReducer = (state: IframelyState, action: IframelyReducerAction): IframelyState => {
  switch (action.type) {
    case 'setIframely': {
      const { href, iframely } = action.value;
      return {
        ...state,
        iframes: {
          ...state.iframes,
          [href]: iframely,
        },
      };
    }
    default:
      return state;
  }
};

const initialState = (): IframelyState => ({
  iframes: {},
});

export type IframelyContextValue = IframelyState & {
  setIframe: (href: string, iframely: Iframely) => void;
};

export const IframelyContext = React.createContext<IframelyContextValue>(
  {} as IframelyContextValue,
);

export const IframelyProvider = ({ children }: PropsWithChildren<{}>) => {
  const [state, dispatch] = useReducer<IframelyReducer>(iframelyReducer, {
    ...initialState(),
  });

  const value = useMemo(
    (): IframelyContextValue => ({
      ...state,
      setIframe: (href, iframely) => dispatch({ type: 'setIframely', value: { href, iframely } }),
    }),
    [state, dispatch],
  );

  return (
    <IframelyContext.Provider value={(value as unknown) as IframelyContextValue}>
      {children}
    </IframelyContext.Provider>
  );
};

export const useIframelyContext = (componentName?: string) => {
  const contextValue = useContext(IframelyContext);
  if (!contextValue) {
    console.warn(
      `The useIframelyContext hook was called outside of the IframelyContext provider. Make sure this hook is called within a child of the Chat component. The errored call is located in the ${componentName} component.`,
    );
    return {} as IframelyContextValue;
  }
  return contextValue;
};

/**
 * Typescript currently does not support partial inference so if ChatContext
 * typing is desired while using the HOC withChatContext the Props for the
 * wrapped component must be provided as the first generic.
 */
export const withIframelyContext = <P extends UnknownType>(Component: React.ComponentType<P>) => {
  const WithIframelyContextComponent = (props: Omit<P, keyof IframelyContextValue>) => {
    const iframelyContext = useIframelyContext();
    return <Component {...(props as P)} {...iframelyContext} />;
  };
  WithIframelyContextComponent.displayName = `WithIframelyContext${getDisplayName(Component)}`;
  return WithIframelyContextComponent;
};
