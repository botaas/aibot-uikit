import debounce from 'lodash.debounce';
import React, {
  PropsWithChildren,
  useContext,
  useReducer,
  Reducer,
  useMemo,
  Dispatch,
  useCallback,
  useEffect,
  ComponentType,
} from 'react';
import type { ReactElement } from 'react-markdown/lib/react-markdown';

type DelayRenderState = {
  renders: Record<string, ReactElement>;
};

type SetRenderAction = {
  type: 'setRender';
  value: {
    key: string;
    render: ReactElement;
  };
};

type DelayRenderReducerAction = SetRenderAction;

type DelayRenderReducer = Reducer<DelayRenderState, DelayRenderReducerAction>;

const delayRenderReducer = (
  state: DelayRenderState,
  action: DelayRenderReducerAction,
): DelayRenderState => {
  switch (action.type) {
    case 'setRender': {
      const { key, render } = action.value;
      return {
        ...state,
        renders: {
          ...state.renders,
          [key]: render,
        },
      };
    }
    default:
      return state;
  }
};

const initialState = (): DelayRenderState => ({
  renders: {},
});

export type DelayRenderContextValue = DelayRenderState & {
  dispatch: Dispatch<DelayRenderReducerAction>;
};

export const DelayRenderContext = React.createContext<DelayRenderContextValue>(
  {} as DelayRenderContextValue,
);

export const DelayRenderProvider = ({ children }: PropsWithChildren<{}>) => {
  const [state, dispatch] = useReducer<DelayRenderReducer>(delayRenderReducer, {
    ...initialState(),
  });

  const value = useMemo(
    (): DelayRenderContextValue => ({
      ...state,
      dispatch,
    }),
    [state, dispatch],
  );

  return <DelayRenderContext.Provider value={value}>{children}</DelayRenderContext.Provider>;
};

export const useDelayRender = (
  props: any,
  keyProp: string,
  Render: ComponentType,
  delayed: number = 500,
): { children: ReactElement } => {
  const { renders, dispatch } = useContext(DelayRenderContext);

  const keyValue = useMemo(() => props[keyProp], [props, keyProp]);

  const children = useMemo(() => renders[keyValue] ?? null, [renders, keyValue]);

  const debouncedRender = useCallback(
    debounce(() => {
      dispatch({
        type: 'setRender',
        value: {
          key: keyValue,
          render: <Render {...props} />,
        },
      });
    }, delayed),
    // TODO iframely 的 props 除了 href 以外，还有其他参数在解析 markdown 时候一直变化
    // 因此这里如果监听了 props，最后是等到解析 markdown 完成以后才会渲染
    // 如果不监听 props，那么链接完整以后就会渲染
    [keyValue, props],
  );

  useEffect(() => {
    if (!children) {
      debouncedRender();
    }
    return () => {
      debouncedRender.cancel();
    };
  }, [children, debouncedRender]);

  return { children };
};

const RenderHolder: React.FC<
  { keyProp: string; Render: ComponentType; delayed?: number } & any
> = ({ keyProp, Render, delayed, ...props }) => {
  const { children } = useDelayRender(props, keyProp, Render, delayed);
  return children;
};

export const delayRender = (keyProp: string, Render: ComponentType, delayed?: number): React.FC => (
  props: any,
) => <RenderHolder keyProp={keyProp} Render={Render} delayed={delayed} {...props} />;
