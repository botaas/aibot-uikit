import type {
	ChannelMemberResponse,
	ChannelMembership,
	FormatMessageResponse,
	Event,
	ExtendableGenerics,
	DefaultGenerics,
	MessageSetType,
	MessageResponse,
	UserResponse,
} from './models';

export type ChannelReadStatus<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = Record<
	string,
	{ last_read: Date; unread_messages: number; user: UserResponse<OneChatGenerics> }
>;

/**
 * ChannelState - A container class for the channel state.
 */
export interface ChannelState<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> {
	watcher_count: number;
	typing: Record<string, Event<OneChatGenerics>>;
	read: ChannelReadStatus<OneChatGenerics>;
	pinnedMessages: Array<ReturnType<ChannelState<OneChatGenerics>['formatMessage']>>;
	threads: Record<string, Array<ReturnType<ChannelState<OneChatGenerics>['formatMessage']>>>;
	watchers: Record<string, UserResponse<OneChatGenerics>>;
	members: Record<string, ChannelMemberResponse<OneChatGenerics>>;
	membership: ChannelMembership<OneChatGenerics>;
	lastMessageAt: Date | null;
	messages: Array<ReturnType<ChannelState<OneChatGenerics>['formatMessage']>>;
	latestMessages: Array<ReturnType<ChannelState<OneChatGenerics>['formatMessage']>>;

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
	) => void

	/**
	 * formatMessage - Takes the message object. Parses the dates, sets __html
	 * and sets the status to received if missing. Returns a message object
	 *
	 * @param {MessageResponse<OneChatGenerics>} message a message object
	 *
	 */
	formatMessage: (message: MessageResponse<OneChatGenerics>) => FormatMessageResponse<OneChatGenerics>

	/**
	 * removeMessage - Description
	 *
	 * @param {{ id: string; parent_id?: string }} messageToRemove Object of the message to remove. Needs to have at id specified.
	 *
	 * @return {boolean} Returns if the message was removed
	 */
	removeMessage: (messageToRemove: { id: string; messageSetIndex?: number; parent_id?: string }) => boolean

	filterErrorMessages: () => void

	/**
	 * loadMessageIntoState - Loads a given message (and messages around it) into the state
	 *
	 * @param {string} messageId The id of the message, or 'latest' to indicate switching to the latest messages
	 * @param {string} parentMessageId The id of the parent message, if we want load a thread reply
	 */
	loadMessageIntoState: (messageId: string | 'latest', parentMessageId?: string, limit?: number) => void
}
