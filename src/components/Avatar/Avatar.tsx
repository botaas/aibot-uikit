import React, { useEffect, useState } from 'react';

import { getWholeChar } from '../../utils';

import type { DefaultOneChatGenerics, UserResponse } from '../../types';

export type AvatarProps<OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics> = {
  /** Image URL or default is an image of the first initial of the name if there is one  */
  image?: string | null;
  /** Name of the image, used for title tag fallback */
  name?: string;
  /** click event handler */
  onClick?: (event: React.BaseSyntheticEvent) => void;
  /** mouseOver event handler */
  onMouseOver?: (event: React.BaseSyntheticEvent) => void;
  /** Shape of the avatar - circle, rounded or square
   * @default circle
   */
  shape?: 'circle' | 'rounded' | 'square';
  /** Size in pixels
   * @default 32px
   */
  size?: number;
  /** The entire user object for the chat user displayed in the component */
  user?: UserResponse<OneChatGenerics>;
};

/**
 * A round avatar image with fallback to username's first letter
 */
export const Avatar = <OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics>(
  props: AvatarProps<OneChatGenerics>,
) => {
  const {
    image,
    name,
    onClick = () => undefined,
    onMouseOver = () => undefined,
    shape = 'circle',
    size = 32,
  } = props;

  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setError(false);
    setLoaded(false);
  }, [image]);

  const nameStr = name?.toString() || '';
  const initials = getWholeChar(nameStr, 0);

  return (
    <div
      className={`str-chat__avatar str-chat__avatar--${shape} str-chat__message-sender-avatar`}
      data-testid='avatar'
      onClick={onClick}
      onMouseOver={onMouseOver}
      style={{
        flexBasis: `${size}px`,
        fontSize: `${size / 2}px`,
        height: `${size}px`,
        lineHeight: `${size}px`,
        width: `${size}px`,
      }}
      title={name}
    >
      {image && !error ? (
        <img
          alt={initials}
          className={`str-chat__avatar-image${loaded ? ' str-chat__avatar-image--loaded' : ''}`}
          data-testid='avatar-img'
          onError={() => setError(true)}
          onLoad={() => setLoaded(true)}
          src={image}
          style={{
            flexBasis: `${size}px`,
            height: `${size}px`,
            objectFit: 'cover',
            width: `${size}px`,
          }}
        />
      ) : (
        <div className='str-chat__avatar-fallback' data-testid='avatar-fallback'>
          {initials}
        </div>
      )}
    </div>
  );
};
