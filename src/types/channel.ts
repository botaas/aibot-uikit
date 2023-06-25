import type { ChannelState } from './channel_state';
import type {
	APIResponse,
	ChannelData,
	ChannelMemberAPIResponse,
	ChannelQueryOptions,
	ChannelResponse,
	DefaultGenerics,
	EventAPIResponse,
	EventHandler,
	ExtendableGenerics,
	GetRepliesAPIResponse,
	MarkReadOptions,
	MarkUnreadOptions,
	MemberSort,
	Message,
	MessagePaginationOptions,
	MessageSetType,
	QueryMembersOptions,
	Reaction,
	ReactionAPIResponse,
	SendMessageAPIResponse,
	UserFilters,
	UserResponse,
	QueryChannelAPIResponse,
	SendFileAPIResponse,
	ChannelConfigWithInfo,
} from './models';

export interface Channel<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> {
	type: string;
	id: string | undefined;
	data: ChannelData<OneChatGenerics> | ChannelResponse<OneChatGenerics> | undefined;
	cid: string;
	state: ChannelState<OneChatGenerics>;
	/**
	 * This boolean is a vague indication of weather the channel exists on chat backend.
	 *
	 * If the value is true, then that means the channel has been initialized by either calling
	 * channel.create() or channel.query() or channel.watch().
	 *
	 * If the value is false, then channel may or may not exist on the backend. The only way to ensure
	 * is by calling channel.create() or channel.query() or channel.watch().
	 */
	initialized: boolean;
	/**
	 * Indicates weather channel has been initialized by manually populating the state with some messages, members etc.
	 * Static state indicates that channel exists on backend, but is not being watched yet.
	 */
	offlineMode: boolean;
	disconnected: boolean;

	/**
	 * getConfig - Get the config for this channel id (cid)
	 *
	 * @return {Record<string, unknown>}
	 */
	getConfig: () => ChannelConfigWithInfo<OneChatGenerics>

	/**
	 * sendMessage - Send a message to this channel
	 *
	 * @param {Message<OneChatGenerics>} message The Message object
	 * @param {boolean} [options.skip_enrich_url] Do not try to enrich the URLs within message
	 * @param {boolean} [options.skip_push] Skip sending push notifications
	 * @param {boolean} [options.is_pending_message] Make this message pending
	 * @param {Record<string,string>} [options.pending_message_metadata] Metadata for the pending message
	 * @param {boolean} [options.force_moderation] Apply force moderation for server-side requests
	 *
	 * @return {Promise<SendMessageAPIResponse<OneChatGenerics>>} The Server Response
	 */
	sendMessage: (
		message: Message<OneChatGenerics>,
		options?: {
			force_moderation?: boolean;
			is_pending_message?: boolean;
			pending_message_metadata?: Record<string, string>;
			skip_enrich_url?: boolean;
			skip_push?: boolean;
		},
	) => Promise<SendMessageAPIResponse<OneChatGenerics>>

	sendFile: (
		uri: string | File,
		name?: string,
		contentType?: string,
		user?: UserResponse<OneChatGenerics>,
	) => Promise<SendFileAPIResponse>

	sendImage: (
		uri: string | File,
		name?: string,
		contentType?: string,
		user?: UserResponse<OneChatGenerics>,
	) => Promise<SendFileAPIResponse>

	deleteFile: (url: string) => Promise<APIResponse>

	deleteImage: (url: string) => Promise<APIResponse>

	sendAction: (messageID: string, formData: Record<string, string>) => Promise<SendMessageAPIResponse<OneChatGenerics>>

	/**
	 * queryMembers - Query Members
	 *
	 * @param {UserFilters<OneChatGenerics>}  filterConditions object MongoDB style filters
	 * @param {MemberSort<OneChatGenerics>} [sort] Sort options, for instance [{created_at: -1}].
	 * When using multiple fields, make sure you use array of objects to guarantee field order, for instance [{name: -1}, {created_at: 1}]
	 * @param {{ limit?: number; offset?: number }} [options] Option object, {limit: 10, offset:10}
	 *
	 * @return {Promise<ChannelMemberAPIResponse<OneChatGenerics>>} Query Members response
	 */
	queryMembers: (
		filterConditions: UserFilters<OneChatGenerics>,
		sort?: MemberSort<OneChatGenerics>,
		options?: QueryMembersOptions,
	) => Promise<ChannelMemberAPIResponse<OneChatGenerics>>

	/**
	 * sendReaction - Send a reaction about a message
	 *
	 * @param {string} messageID the message id
	 * @param {Reaction<OneChatGenerics>} reaction the reaction object for instance {type: 'love'}
	 * @param {{ enforce_unique?: boolean, skip_push?: boolean }} [options] Option object, {enforce_unique: true, skip_push: true} to override any existing reaction or skip sending push notifications
	 *
	 * @return {Promise<ReactionAPIResponse<OneChatGenerics>>} The Server Response
	 */
	sendReaction: (
		messageID: string,
		reaction: Reaction<OneChatGenerics>,
		options?: { enforce_unique?: boolean; skip_push?: boolean },
	) => Promise<ReactionAPIResponse<OneChatGenerics>>

	/**
	 * deleteReaction - Delete a reaction by user and type
	 *
	 * @param {string} messageID the id of the message from which te remove the reaction
	 * @param {string} reactionType the type of reaction that should be removed
	 * @param {string} [user_id] the id of the user (used only for server side request) default null
	 *
	 * @return {Promise<ReactionAPIResponse<OneChatGenerics>>} The Server Response
	 */
	deleteReaction: (messageID: string, reactionType: string, user_id?: string) => Promise<ReactionAPIResponse<OneChatGenerics>>

	/**
	 * muteStatus - returns the mute status for the current channel
	 * @return {{ muted: boolean; createdAt: Date | null; expiresAt: Date | null }} { muted: true | false, createdAt: Date | null, expiresAt: Date | null}
	 */
	muteStatus: () => {
		createdAt: Date | null;
		expiresAt: Date | null;
		muted: boolean;
	}

	/**
	 * keystroke - First of the typing.start and typing.stop events based on the users keystrokes.
	 * Call this on every keystroke
	 * @see {@link https://openbot.chat/chat/docs/typing_indicators/?language=js|Docs}
	 * @param {string} [parent_id] set this field to `message.id` to indicate that typing event is happening in a thread
	 */
	keystroke: (parent_id?: string) => Promise<void>

	/**
	 * stopTyping - Sets last typing to null and sends the typing.stop event
	 * @see {@link https://openbot.chat/chat/docs/typing_indicators/?language=js|Docs}
	 * @param {string} [parent_id] set this field to `message.id` to indicate that typing event is happening in a thread
	 */
	stopTyping: (parent_id?: string) => Promise<void>

	/**
	 * markRead - Send the mark read event for this user, only works if the `read_events` setting is enabled
	 *
	 * @param {MarkReadOptions<OneChatGenerics>} data
	 * @return {Promise<EventAPIResponse<OneChatGenerics> | null>} Description
	 */
	markRead: (data?: MarkReadOptions<OneChatGenerics>) => Promise<EventAPIResponse<OneChatGenerics>>

	/**
	 * markUnread - Mark the channel as unread from messageID, only works if the `read_events` setting is enabled
	 *
	 * @param {MarkUnreadOptions<OneChatGenerics>} data
	 * @return {APIResponse} An API response
	 */
	markUnread: (data: MarkUnreadOptions<OneChatGenerics>) => Promise<APIResponse>

	/**
	 * watch - Loads the initial channel state and watches for changes
	 *
	 * @param {ChannelQueryOptions<OneChatGenerics>} options additional options for the query endpoint
	 *
	 * @return {Promise<QueryChannelAPIResponse<OneChatGenerics>>} The server response
	 */
	watch: (options?: ChannelQueryOptions<OneChatGenerics>) => Promise<QueryChannelAPIResponse<OneChatGenerics>>

	/**
	 * getReplies - List the message replies for a parent message
	 *
	 * @param {string} parent_id The message parent id, ie the top of the thread
	 * @param {MessagePaginationOptions & { user?: UserResponse<OneChatGenerics>; user_id?: string }} options Pagination params, ie {limit:10, id_lte: 10}
	 *
	 * @return {Promise<GetRepliesAPIResponse<OneChatGenerics>>} A response with a list of messages
	 */
	getReplies: (
		parent_id: string,
		options: MessagePaginationOptions & { user?: UserResponse<OneChatGenerics>; user_id?: string },
	) => Promise<GetRepliesAPIResponse<OneChatGenerics>>

	/**
	 * lastRead - returns the last time the user marked the channel as read if the user never marked the channel as read, this will return null
	 * @return {Date | null | undefined}
	 */
	lastRead: () => Date | null | undefined

	/**
	 * countUnread - Count of unread messages
	 *
	 * @param {Date | null} [lastRead] lastRead the time that the user read a message, defaults to current user's read state
	 *
	 * @return {number} Unread count
	 */
	countUnread: (lastRead?: Date | null) => number

	/**
	 * query - Query the API, get messages, members or other channel fields
	 *
	 * @param {ChannelQueryOptions<OneChatGenerics>} options The query options
	 * @param {MessageSetType} messageSetToAddToIfDoesNotExist It's possible to load disjunct sets of a channel's messages into state, use `current` to load the initial channel state or if you want to extend the currently displayed messages, use `latest` if you want to load/extend the latest messages, `new` is used for loading a specific message and it's surroundings
	 *
	 * @return {Promise<QueryChannelAPIResponse<OneChatGenerics>>} Returns a query response
	 */
	query: (
		options: ChannelQueryOptions<OneChatGenerics>,
		messageSetToAddToIfDoesNotExist?: MessageSetType,
	) => Promise<QueryChannelAPIResponse<OneChatGenerics>>

	/**
	 * on - Listen to events on all channels and users your watching
	 *
	 * client.on('message.new', event => {console.log("my new message", event, channel.state.messages)})
	 * or
	 * client.on(event => {console.log(event.type)})
	 *
	 * @param {EventHandler<OneChatGenerics> | string} callbackOrString  The event type to listen for (optional)
	 * @param {EventHandler<OneChatGenerics>} [callbackOrNothing] The callback to call
	 *
	 * @return {{ unsubscribe: () => void }} Description
	 */
	on: (callbackOrString: EventHandler<OneChatGenerics> | string, callbackOrNothing?: EventHandler<OneChatGenerics>) => { unsubscribe: () => void };

	/**
	 * off - Remove the event handler
	 */
	off: (callbackOrString: EventHandler<OneChatGenerics> | string, callbackOrNothing?: EventHandler<OneChatGenerics>) => void;
}
