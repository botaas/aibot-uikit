import React from 'react';
import type { Attachment, DefaultOneChatGenerics } from '../../types';

export type UnsupportedAttachmentProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  attachment: Attachment<OneChatGenerics>;
};

export const UnsupportedAttachment = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>({
  attachment,
}: UnsupportedAttachmentProps<OneChatGenerics>) => (
  <div>
    <div>
      Unsupported attachment type <strong>{attachment.type ?? 'unknown'}</strong>
    </div>
    <code>{JSON.stringify(attachment, null, 4)}</code>;
  </div>
);

export const NullComponent = () => null;
