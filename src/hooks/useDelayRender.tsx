import React, { useMemo, useCallback, useEffect, ComponentType, useState } from 'react';
import debounce from 'lodash.debounce';

export function useDelayRender<T extends JSX.IntrinsicAttributes>(
  props: T,
  keyProp: keyof T,
  Render: ComponentType<T>,
  delayed: number = 500,
): ReturnType<React.FC<T>> {
  const [canRender, setCanRender] = useState(false);

  // 直到key不再变化，才进行渲染
  const key = useMemo(() => props[keyProp], [props]);
  const debouncedRender = useCallback(
    debounce(() => setCanRender(true), delayed),
    [setCanRender, key],
  );

  useEffect(() => {
    if (!canRender) {
      debouncedRender();
    }
    return () => {
      debouncedRender.cancel();
    };
  }, [canRender, debouncedRender]);

  if (!canRender) return null;

  return <Render {...props} />;
}

export function delayRender<T extends JSX.IntrinsicAttributes>(
  keyProp: keyof T,
  Render: ComponentType<T>,
  delayed?: number,
): React.FC<T> {
  return (props: T) => useDelayRender(props, keyProp, Render, delayed);
}
