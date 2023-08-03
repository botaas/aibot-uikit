import React, {
  PropsWithChildren,
  useContext,
  useReducer,
  Reducer,
  useCallback,
  useMemo,
} from 'react';

type IFramelyError = { code: string | number; message: string };

type IFramelyState = {
  // url 的 iframely 结果
  results: Record<
    string,
    {
      html?: string;
      mediaType?: string;
      error?: IFramelyError;
    }
  >;
  // url 对应的查询状态
  loadings: Record<string, boolean>;
};

type SetResultAction = {
  type: 'setResult';
  value: {
    url: string;
    result: {
      html?: string;
      mediaType?: string;
      error?: IFramelyError;
    };
  };
};

type SetLoadingAction = {
  type: 'setLoading';
  value: {
    url: string;
    loading: boolean;
  };
};

type IFramelyReducerAction = SetResultAction | SetLoadingAction;

type IFramelyStateReducer = Reducer<IFramelyState, IFramelyReducerAction>;

const iframelyReducer = (state: IFramelyState, action: IFramelyReducerAction): IFramelyState => {
  switch (action.type) {
    case 'setLoading': {
      const { url, loading } = action.value;
      return {
        ...state,
        loadings: {
          ...state.loadings,
          [url]: loading,
        },
      };
    }
    case 'setResult': {
      const { url, result } = action.value;
      return {
        ...state,
        results: {
          ...state.results,
          [url]: result,
        },
      };
    }
    default:
      return state;
  }
};

const initialState: IFramelyState = {
  results: {},
  loadings: {},
};

export type IFramelyContextValue = IFramelyState & {
  doFetch: (url: string) => void;
};

export const IFramelyContext = React.createContext<IFramelyContextValue>(
  {} as IFramelyContextValue,
);

const KEY = '2ff2c1b746d605de30463e';

export const IFramelyProvider = ({ children }: PropsWithChildren<{}>) => {
  const [state, dispatch] = useReducer<IFramelyStateReducer>(iframelyReducer, { ...initialState });

  // 查询iframely
  const doFetch = useCallback(
    (url: string) => {
      dispatch({
        type: 'setLoading',
        value: { url, loading: true },
      });

      fetch(
        `https://cdn.iframe.ly/api/iframely?url=${encodeURIComponent(
          url,
        )}&api_key=${KEY}&iframe=1&omit_script=1`,
      )
        .then((res) => res.json())
        .then(
          (res) => {
            dispatch({
              type: 'setLoading',
              value: { url, loading: false },
            });

            if (res.html) {
              dispatch({
                type: 'setResult',
                value: {
                  url,
                  result: {
                    html: res.html,
                    mediaType: res.meta?.medium,
                  },
                },
              });
            } else if (res.error) {
              dispatch({
                type: 'setResult',
                value: {
                  url,
                  result: {
                    error: { code: res.error, message: res.message },
                  },
                },
              });
            }
          },
          (error) => {
            dispatch({
              type: 'setLoading',
              value: {
                url,
                loading: false,
              },
            });
            dispatch({
              type: 'setResult',
              value: {
                url,
                result: {
                  error,
                },
              },
            });
          },
        );
    },
    [dispatch],
  );

  const value = useMemo(
    (): IFramelyContextValue => ({
      ...state,
      doFetch,
    }),
    [state, doFetch],
  );

  return <IFramelyContext.Provider value={value}>{children}</IFramelyContext.Provider>;
};

export const useIFramelyContext = (componentName?: string): IFramelyContextValue => {
  const contextValue = useContext(IFramelyContext);

  if (!contextValue) {
    console.warn(
      `The useIFramelyContext hook was called outside of the IFramelyContext provider. Make sure this hook is called within the Message's UI component. The errored call is located in the ${componentName} component.`,
    );
    return {} as IFramelyContextValue;
  }

  return (contextValue as unknown) as IFramelyContextValue;
};
