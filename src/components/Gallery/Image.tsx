import React, { CSSProperties, MutableRefObject, useState } from 'react';
import { sanitizeUrl } from '@braintree/sanitize-url';

import { Modal } from '../Modal';
import { ModalGallery as DefaultModalGallery } from './ModalGallery';
import { useComponentContext } from '../../context';

import type { Attachment, DefaultOneChatGenerics, Dimensions } from '../../types';

export type ImageProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  dimensions?: Dimensions;
  innerRef?: MutableRefObject<HTMLImageElement | null>;
  previewUrl?: string;
  style?: CSSProperties;
} & (
    | {
      /** The text fallback for the image */
      fallback?: string;
      /** The full size image url */
      image_url?: string;
      /** The thumb url */
      thumb_url?: string;
    }
    | Attachment<OneChatGenerics>
  );

/**
 * A simple component that displays an image.
 */
export const ImageComponent = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: ImageProps<OneChatGenerics>,
) => {
  const { dimensions = {}, fallback, image_url, thumb_url, innerRef, previewUrl, style } = props;

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { ModalGallery = DefaultModalGallery } = useComponentContext('ImageComponent');

  const imageSrc = sanitizeUrl(previewUrl || image_url || thumb_url);

  const toggleModal = () => setModalIsOpen((modalIsOpen) => !modalIsOpen);

  return (
    <>
      <img
        alt={fallback}
        className='str-chat__message-attachment--img'
        data-testid='image-test'
        onClick={toggleModal}
        src={imageSrc}
        style={style}
        tabIndex={0}
        {...dimensions}
        {...(innerRef && { ref: innerRef })}
      />
      <Modal onClose={toggleModal} open={modalIsOpen}>
        <ModalGallery images={[props]} index={0} />
      </Modal>
    </>
  );
};
