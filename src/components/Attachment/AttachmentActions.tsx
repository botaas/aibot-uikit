import React from 'react';
import type { Action, Attachment, DefaultOneChatGenerics } from '../../types';

import type { ActionHandlerReturnType } from '../Message/hooks/useActionHandler';

export type AttachmentActionsProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = Attachment<OneChatGenerics> & {
  /** A list of actions */
  actions: Action[];
  /** Unique id for action button key. Key is generated by concatenating this id with action value - {`${id}-${action.value}`} */
  id: string;
  /** The text for the form input */
  text: string;
  /** Click event handler */
  actionHandler?: ActionHandlerReturnType;
};

const UnMemoizedAttachmentActions = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: AttachmentActionsProps<OneChatGenerics>,
) => {
  const { actionHandler, actions, id, text } = props;

  const handleActionClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    name?: string,
    value?: string,
  ) => actionHandler?.(name, value, event);

  return (
    <div className='str-chat__message-attachment-actions'>
      <div className='str-chat__message-attachment-actions-form'>
        <span>{text}</span>
        {actions.map((action) => (
          <button
            className={`str-chat__message-attachment-actions-button str-chat__message-attachment-actions-button--${action.style}`}
            data-testid={`${action.name}`}
            data-value={action.value}
            key={`${id}-${action.value}`}
            onClick={(event) => handleActionClick(event, action.name, action.value)}
          >
            {action.text}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * A component for rendering the actions you can take on an attachment.
 */
export const AttachmentActions = React.memo(
  UnMemoizedAttachmentActions,
) as typeof UnMemoizedAttachmentActions;
