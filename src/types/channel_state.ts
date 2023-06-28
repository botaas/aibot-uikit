import type {
  ChannelMemberResponse,
  ChannelMembership,
  DefaultGenerics,
  Event,
  ExtendableGenerics,
  FormatMessageResponse,
  MessageResponse,
  MessageSetType,
  UserResponse,
} from './models';

export type ChannelReadStatus<
  OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = Record<
  string,
  { last_read: Date; unread_messages: number; user: UserResponse<OneChatGenerics> }
>;

/**
 * ChannelState - A container class for the channel state.
 */
export interface ChannelState<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> {
  /**
   * addMessageSorted - Add a message to the state
   *
   * @param {MessageResponse<OneChatGenerics>} newMessage A new message
   * @param {boolean} timestampChanged Whether updating a message with changed created_at value.
   * @param {boolean} addIfDoesNotExist Add message if it is not in the list, used to prevent out of order updated messages from being added.
   * @param {MessageSetType} messageSetToAddToIfDoesNotExist Which message set to add to if message is not in the list (only used if addIfDoesNotExist is true)
   */
  addMessageSorted: (
    newMessage: MessageResponse<OneChatGenerics>,
    timestampChanged?: boolean,
    addIfDoesNotExist?: boolean,
    messageSetToAddToIfDoesNotExist?: MessageSetType,
  ) => void;
  filterErrorMessages: () => void;
  /**
   * formatMessage - Takes the message object. Parses the dates, sets __html
   * and sets the status to received if missing. Returns a message object
   *
   * @param {MessageResponse<OneChatGenerics>} message a message object
   *
   */
  formatMessage: (
    message: MessageResponse<OneChatGenerics>,
  ) => FormatMessageResponse<OneChatGenerics>;
  lastMessageAt: Date | null;
  latestMessages: Array<ReturnType<ChannelState<OneChatGenerics>['formatMessage']>>;
  /**
   * loadMessageIntoState - Loads a given message (and messages around it) into the state
   *
   * @param {string} messageId The id of the message, or 'latest' to indicate switching to the latest messages
   * @param {string} parentMessageId The id of the parent message, if we want load a thread reply
   */
  loadMessageIntoState: (
    messageId: string | 'latest',
    parentMessageId?: string,
    limit?: number,
  ) => void;
  members: Record<string, ChannelMemberResponse<OneChatGenerics>>;
  membership: ChannelMembership<OneChatGenerics>;
  messages: Array<ReturnType<ChannelState<OneChatGenerics>['formatMessage']>>;
  pinnedMessages: Array<ReturnType<ChannelState<OneChatGenerics>['formatMessage']>>;
  read: ChannelReadStatus<OneChatGenerics>;
  /**
   * removeMessage - Description
   *
   * @param {{ id: string; parent_id?: string }} messageToRemove Object of the message to remove. Needs to have at id specified.
   *
   * @return {boolean} Returns if the message was removed
   */
  removeMessage: (messageToRemove: {
    id: string;
    messageSetIndex?: number;
    parent_id?: string;
  }) => boolean;

  threads: Record<string, Array<ReturnType<ChannelState<OneChatGenerics>['formatMessage']>>>;

  typing: Record<string, Event<OneChatGenerics>>;

  /**
   * Updates all instances of given message in channel state
   * @param message
   * @param updateFunc
   */
  updateMessage: (
    message: {
      id?: string;
      parent_id?: string;
      pinned?: boolean;
      show_in_channel?: boolean;
    },
    updateFunc: (
      msg: ReturnType<ChannelState<OneChatGenerics>['formatMessage']>,
    ) => ReturnType<ChannelState<OneChatGenerics>['formatMessage']>,
  ) => void;

  watcher_count: number;

  unreadCount: number;

  watchers: Record<string, UserResponse<OneChatGenerics>>;
}
