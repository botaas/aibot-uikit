import React, { PropsWithChildren, ReactNode } from 'react';
import ReactPlayer from 'react-player';
import clsx from 'clsx';

import type { ATTACHMENT_GROUPS_ORDER } from './Attachment';
import { AttachmentActions as DefaultAttachmentActions } from './AttachmentActions';
import { Audio as DefaultAudio } from './Audio';
import { Card as DefaultCard } from './Card';
import { FileAttachment as DefaultFile } from './FileAttachment';
import { Gallery as DefaultGallery, ImageComponent as DefaultImage } from '../Gallery';

import type { AttachmentProps } from './Attachment';
import type { Attachment, DefaultOneChatGenerics } from '../../types';

export const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/ogg', 'video/webm', 'video/quicktime'];

export type AttachmentComponentType = typeof ATTACHMENT_GROUPS_ORDER[number];

export type GroupedRenderedAttachment = Record<AttachmentComponentType, ReactNode[]>;

export type GalleryAttachment<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  images: Attachment<OneChatGenerics>[];
  type: 'gallery';
};

export type AttachmentContainerProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  attachment: Attachment<OneChatGenerics> | GalleryAttachment<OneChatGenerics>;
  componentType: AttachmentComponentType;
};

export type RenderAttachmentProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = Omit<AttachmentProps<OneChatGenerics>, 'attachments'> & {
  attachment: Attachment<OneChatGenerics>;
};

export type RenderGalleryProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = Omit<AttachmentProps<OneChatGenerics>, 'attachments'> & {
  attachment: GalleryAttachment<OneChatGenerics>;
};

export const isScrapedContent = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  attachment: Attachment<OneChatGenerics>,
) => attachment.og_scrape_url || attachment.title_link;

export const isUploadedImage = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  attachment: Attachment<OneChatGenerics>,
) => attachment.type === 'image' && !isScrapedContent(attachment);

export const isGalleryAttachmentType = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  output: Attachment<OneChatGenerics> | GalleryAttachment<OneChatGenerics>,
): output is GalleryAttachment<OneChatGenerics> => Array.isArray(output.images);

export const isAudioAttachment = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  attachment: Attachment<OneChatGenerics>,
) => attachment.type === 'audio';

export const isFileAttachment = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  attachment: Attachment<OneChatGenerics>,
) =>
  attachment.type === 'file' ||
  (attachment.mime_type &&
    SUPPORTED_VIDEO_FORMATS.indexOf(attachment.mime_type) === -1 &&
    attachment.type !== 'video');

export const isMediaAttachment = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  attachment: Attachment<OneChatGenerics>,
) =>
  (attachment.mime_type && SUPPORTED_VIDEO_FORMATS.indexOf(attachment.mime_type) !== -1) ||
  attachment.type === 'video';

export const isSvgAttachment = (attachment: Attachment) => {
  const filename = attachment.fallback || '';
  return filename.toLowerCase().endsWith('.svg');
};

/**
 * @deprecated will be removed in the next major release,
 * replaced with the proper component equivalent `AttachmentContainer/AttachmentWithinContainer`
 */
export const renderAttachmentWithinContainer = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: PropsWithChildren<AttachmentContainerProps<OneChatGenerics>>,
) => {
  const { attachment, children, componentType } = props;
  const isGAT = isGalleryAttachmentType(attachment);
  let extra = '';

  if (!isGAT) {
    extra =
      componentType === 'card' && !attachment?.image_url && !attachment?.thumb_url
        ? 'no-image'
        : attachment?.actions?.length
        ? 'actions'
        : '';
  }

  const classNames = clsx('str-chat__message-attachment', {
    [`str-chat__message-attachment--${componentType}`]: componentType,
    [`str-chat__message-attachment--${attachment?.type}`]: attachment?.type,
    [`str-chat__message-attachment--${componentType}--${extra}`]: componentType && extra,
    'str-chat__message-attachment--svg-image': isSvgAttachment(attachment),
    'str-chat__message-attachment-with-actions': extra === 'actions', // added for theme V2 (better readability)
  });

  return <div className={classNames}>{children}</div>;
};

/**
 * @deprecated will be removed in the next major release,
 * replaced with the proper component equivalent `AttachmentContainer/AttachmentActionsContainer`
 */
export const renderAttachmentActions = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: RenderAttachmentProps<OneChatGenerics>,
) => {
  const { actionHandler, attachment, AttachmentActions = DefaultAttachmentActions } = props;

  if (!attachment.actions?.length) return null;

  return (
    <AttachmentActions
      {...attachment}
      actionHandler={(event, name, value) => actionHandler?.(event, name, value)}
      actions={attachment.actions}
      id={attachment.id || ''}
      key={`key-actions-${attachment.id}`}
      text={attachment.text || ''}
    />
  );
};

/**
 * @deprecated will be removed in the next major release,
 * replaced with the proper component equivalent `AttachmentContainer/GalleryContainer`
 */
export const renderGallery = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: RenderGalleryProps<OneChatGenerics>,
) => {
  const { attachment, Gallery = DefaultGallery } = props;

  return renderAttachmentWithinContainer({
    attachment,
    children: <Gallery images={attachment.images || []} key='gallery' />,
    componentType: 'gallery',
  });
};

/**
 * @deprecated will be removed in the next major release,
 * replaced with the proper component equivalent `AttachmentContainer/ImageContainer`
 */
export const renderImage = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: RenderAttachmentProps<OneChatGenerics>,
) => {
  const { attachment, Image = DefaultImage } = props;

  if (attachment.actions && attachment.actions.length) {
    return renderAttachmentWithinContainer({
      attachment,
      children: (
        <div className='str-chat__attachment' key={`key-image-${attachment.id}`}>
          {<Image {...attachment} />}
          {renderAttachmentActions(props)}
        </div>
      ),
      componentType: 'image',
    });
  }

  return renderAttachmentWithinContainer({
    attachment,
    children: <Image {...attachment} key={`key-image-${attachment.id}`} />,
    componentType: 'image',
  });
};

/**
 * @deprecated will be removed in the next major release,
 * replaced with the proper component equivalent `AttachmentContainer/CardContainer`
 */
export const renderCard = <OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics>(
  props: RenderAttachmentProps<OneChatGenerics>,
) => {
  const { attachment, Card = DefaultCard } = props;

  if (attachment.actions && attachment.actions.length) {
    return renderAttachmentWithinContainer({
      attachment,
      children: (
        <div className='str-chat__attachment' key={`key-image-${attachment.id}`}>
          <Card {...attachment} key={`key-card-${attachment.id}`} />
          {renderAttachmentActions(props)}
        </div>
      ),
      componentType: 'card',
    });
  }

  return renderAttachmentWithinContainer({
    attachment,
    children: <Card {...attachment} key={`key-card-${attachment.id}`} />,
    componentType: 'card',
  });
};

/**
 * @deprecated will be removed in the next major release,
 * replaced with the proper component equivalent `AttachmentContainer/FileContainer`
 */
export const renderFile = <OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics>(
  props: RenderAttachmentProps<OneChatGenerics>,
) => {
  const { attachment, File = DefaultFile } = props;

  if (!attachment.asset_url) return null;

  return renderAttachmentWithinContainer({
    attachment,
    children: <File attachment={attachment} key={`key-file-${attachment.id}`} />,
    componentType: 'file',
  });
};

/**
 * @deprecated will be removed in the next major release,
 * replaced with the proper component equivalent `AttachmentContainer/AudioContainer`
 */
export const renderAudio = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: RenderAttachmentProps<OneChatGenerics>,
) => {
  const { attachment, Audio = DefaultAudio } = props;

  return renderAttachmentWithinContainer({
    attachment,
    children: (
      <div className='str-chat__attachment' key={`key-video-${attachment.id}`}>
        <Audio og={attachment} />
      </div>
    ),
    componentType: 'audio',
  });
};

/**
 * @deprecated will be removed in the next major release,
 * replaced with the proper component equivalent `AttachmentContainer/MediaContainer`
 */
export const renderMedia = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: RenderAttachmentProps<OneChatGenerics>,
) => {
  const { attachment, Media = ReactPlayer } = props;

  if (attachment.actions?.length) {
    return renderAttachmentWithinContainer({
      attachment,
      children: (
        <div
          className='str-chat__attachment str-chat__attachment-media'
          key={`key-video-${attachment.id}`}
        >
          <div className='str-chat__player-wrapper'>
            <Media
              className='react-player'
              controls
              height='100%'
              url={attachment.asset_url}
              width='100%'
            />
          </div>
          {renderAttachmentActions(props)}
        </div>
      ),
      componentType: 'media',
    });
  }

  return renderAttachmentWithinContainer({
    attachment,
    children: (
      <div className='str-chat__player-wrapper' key={`key-video-${attachment.id}`}>
        <Media
          className='react-player'
          controls
          height='100%'
          url={attachment.asset_url}
          width='100%'
        />
      </div>
    ),
    componentType: 'media',
  });
};
