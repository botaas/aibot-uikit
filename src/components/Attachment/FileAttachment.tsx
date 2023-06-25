import React from 'react';
import { FileIcon } from 'react-file-utils';

import { DownloadButton } from './DownloadButton';
import { FileSizeIndicator } from './FileSizeIndicator';
import { SafeAnchor } from '../SafeAnchor/SafeAnchor';

import { useChatContext } from '../../context/ChatContext';

import type { Attachment, DefaultOneChatGenerics } from '../../types';

export type FileAttachmentProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  attachment: Attachment<OneChatGenerics>;
};

const UnMemoizedFileAttachmentV1 = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>({
  attachment,
}: FileAttachmentProps<OneChatGenerics>) => (
  <div className='str-chat__message-attachment-file--item' data-testid='attachment-file'>
    <FileIcon big={true} mimeType={attachment.mime_type} size={30} />
    <div className='str-chat__message-attachment-file--item-text'>
      <SafeAnchor download href={attachment.asset_url} target='_blank'>
        {attachment.title}
      </SafeAnchor>
      <FileSizeIndicator fileSize={attachment.file_size} />
    </div>
  </div>
);

const UnMemoizedFileAttachmentV2 = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>({
  attachment,
}: FileAttachmentProps<OneChatGenerics>) => (
  <div className='str-chat__message-attachment-file--item' data-testid='attachment-file'>
    <FileIcon className='str-chat__file-icon' mimeType={attachment.mime_type} version={'2'} />
    <div className='str-chat__message-attachment-file--item-text'>
      <div className='str-chat__message-attachment-file--item-first-row'>
        <div className='str-chat__message-attachment-file--item-name' data-testid='file-title'>
          {attachment.title}
        </div>
        <DownloadButton assetUrl={attachment.asset_url} />
      </div>
      <FileSizeIndicator fileSize={attachment.file_size} />
    </div>
  </div>
);

const UnMemoizedFileAttachment = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>({
  attachment,
}: FileAttachmentProps<OneChatGenerics>) => {
  const { themeVersion } = useChatContext('FileAttachment');

  return themeVersion === '2' ? (
    <UnMemoizedFileAttachmentV2 attachment={attachment} />
  ) : (
    <UnMemoizedFileAttachmentV1 attachment={attachment} />
  );
};

export const FileAttachment = React.memo(
  UnMemoizedFileAttachment,
) as typeof UnMemoizedFileAttachment;
