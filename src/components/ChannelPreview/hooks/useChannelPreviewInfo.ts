import { useEffect, useState } from 'react';

import { getDisplayImage, getDisplayTitle } from '../utils';
import type { Channel, DefaultOneChatGenerics } from '../../../types';

import { useChatContext } from '../../../context';

export type ChannelPreviewInfoParams<OneChatGenerics extends DefaultOneChatGenerics> = {
  channel: Channel<OneChatGenerics>;
  /** Manually set the image to render, defaults to the Channel image */
  overrideImage?: string;
  /** Set title manually */
  overrideTitle?: string;
};

export const useChannelPreviewInfo = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: ChannelPreviewInfoParams<OneChatGenerics>,
) => {
  const { channel, overrideImage, overrideTitle } = props;

  const { client } = useChatContext<OneChatGenerics>('ChannelPreview');
  const [displayTitle, setDisplayTitle] = useState(getDisplayTitle(channel, client.user));
  const [displayImage, setDisplayImage] = useState(getDisplayImage(channel, client.user));

  useEffect(() => {
    const handleEvent = () => {
      setDisplayTitle((displayTitle) => {
        const newDisplayTitle = getDisplayTitle(channel, client.user);
        return displayTitle !== newDisplayTitle ? newDisplayTitle : displayTitle;
      });
      setDisplayImage((displayImage) => {
        const newDisplayImage = getDisplayImage(channel, client.user);
        return displayImage !== newDisplayImage ? newDisplayImage : displayImage;
      });
    };

    client.on('user.updated', handleEvent);
    return () => {
      client.off('user.updated', handleEvent);
    };
  }, []);

  return {
    displayImage: overrideImage || displayImage,
    displayTitle: overrideTitle || displayTitle,
  };
};
