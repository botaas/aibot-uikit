import React, { useMemo } from 'react';
import ImageGallery from 'react-image-gallery';

import type { Attachment, DefaultOneChatGenerics } from '../../types';

export type ModalGalleryProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  /** The images for the Carousel component */
  images: Attachment<OneChatGenerics>[];
  /** The index for the component */
  index?: number;
};

export const ModalGallery = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: ModalGalleryProps<OneChatGenerics>,
) => {
  const { images, index } = props;

  const formattedArray = useMemo(
    () =>
      images.map((image) => {
        const imageSrc = image.image_url || image.thumb_url || '';
        return {
          original: imageSrc,
          originalAlt: 'User uploaded content',
          source: imageSrc,
        };
      }),
    [images],
  );

  return (
    <ImageGallery
      items={formattedArray}
      showIndex={true}
      showPlayButton={false}
      showThumbnails={false}
      startIndex={index}
    />
  );
};
