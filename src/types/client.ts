/* eslint no-unused-vars: "off" */
/* global process */

import type { Channel } from './channel';

import type {
  APIResponse,
  AppSettingsAPIResponse,
  ChannelData,
  ChannelFilters,
  ChannelOptions,
  ChannelSort,
  ChannelStateOptions,
  DefaultGenerics,
  Event,
  EventHandler,
  ExtendableGenerics,
  GetMessageAPIResponse,
  MessageResponse,
  MuteUserOptions,
  MuteUserResponse,
  OwnUserResponse,
  UpdatedMessage,
  UpdateMessageAPIResponse,
  UserFilters,
  UserOptions,
  UserResponse,
  UserSort,
} from './models';

export interface Client<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> {
  activeChannels: {
    [key: string]: Channel<OneChatGenerics>;
  };
  /**
   * channel - Returns a new channel with the given type, id and custom data
   *
   * If you want to create a unique conversation between 2 or more users; you can leave out the ID parameter and provide the list of members.
   * Make sure to await channel.create() or channel.watch() before accessing channel functions:
   * ie. channel = client.channel("messaging", {members: ["tommaso", "thierry"]})
   * await channel.create() to assign an ID to channel
   *
   * @param {string} channelType The channel type
   * @param {string | ChannelData<OneChatGenerics> | null} [channelIDOrCustom]   The channel ID, you can leave this out if you want to create a conversation channel
   * @param {object} [custom]    Custom data to attach to the channel
   *
   * @return {channel} The channel object, initialize it using channel.watch()
   */
  channel(
    channelType: string,
    channelIDOrCustom?: string | ChannelData<OneChatGenerics> | null,
    custom?: ChannelData<OneChatGenerics>,
  ): Channel<OneChatGenerics>;
  deleteMessage: (
    messageID: string,
    hardDelete?: boolean,
  ) => Promise<APIResponse & { message: MessageResponse<OneChatGenerics> }>;
  dispatchEvent: (event: Event<OneChatGenerics>) => void;
  /**
   * flagMessage - flag a message
   * @param {string} targetMessageID
   * @param {string} [options.user_id] currentUserID, only used with serverside auth
   * @returns {Promise<APIResponse>}
   */
  flagMessage: (targetMessageID: string, options?: { user_id?: string }) => Promise<APIResponse>;

  getAppSettings: () => Promise<AppSettingsAPIResponse<OneChatGenerics>>;

  getMessage(messageID: string): Promise<GetMessageAPIResponse<OneChatGenerics>>;

  getUserAgent: () => string;

  hash(): string;

  /** muteUser - mutes a user
   *
   * @param {string} targetID
   * @param {string} [userID] Only used with serverside auth
   * @param {MuteUserOptions<OneChatGenerics>} [options]
   * @returns {Promise<MuteUserResponse<OneChatGenerics>>}
   */
  muteUser: (
    targetID: string,
    userID?: string,
    options?: MuteUserOptions<OneChatGenerics>,
  ) => Promise<MuteUserResponse<OneChatGenerics>>;

  /**
   * off - Remove the event handler
   */
  off: (
    callbackOrString: EventHandler<OneChatGenerics> | string,
    callbackOrNothing?: EventHandler<OneChatGenerics>,
  ) => void;

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
  on: (
    callbackOrString: EventHandler<OneChatGenerics> | string,
    callbackOrNothing?: EventHandler<OneChatGenerics>,
  ) => { unsubscribe: () => void };

  /**
   * pinMessage - pins the message
   * @param {string | { id: string }} messageOrMessageId message object or message id
   * @param {undefined|null|number|string|Date} timeoutOrExpirationDate expiration date or timeout. Use number type to set timeout in seconds, string or Date to set exact expiration date
   * @param {undefined|string | { id: string }} [pinnedBy] who will appear as a user who pinned a message. Only for server-side use. Provide `undefined` when pinning message client-side
   * @param {undefined|number|string|Date} pinnedAt date when message should be pinned. It affects the order of pinned messages. Use negative number to set relative time in the past, string or Date to set exact date of pin
   */
  pinMessage: (
    messageOrMessageId: string | { id: string },
    timeoutOrExpirationDate?: null | number | string | Date,
    pinnedBy?: string | { id: string },
    pinnedAt?: number | string | Date,
  ) => Promise<UpdateMessageAPIResponse<OneChatGenerics>>;

  /**
   * queryChannels - Query channels
   *
   * @param {ChannelFilters<OneChatGenerics>} filterConditions object MongoDB style filters
   * @param {ChannelSort<OneChatGenerics>} [sort] Sort options, for instance {created_at: -1}.
   * When using multiple fields, make sure you use array of objects to guarantee field order, for instance [{last_updated: -1}, {created_at: 1}]
   * @param {ChannelOptions} [options] Options object
   * @param {ChannelStateOptions} [stateOptions] State options object. These options will only be used for state management and won't be sent in the request.
   * - stateOptions.skipInitialization - Skips the initialization of the state for the channels matching the ids in the list.
   *
   * @return {Promise<{ channels: Array<ChannelAPIResponse<OneChatGenerics>>}> } search channels response
   */
  queryChannels: (
    filterConditions: ChannelFilters<OneChatGenerics>,
    sort?: ChannelSort<OneChatGenerics>,
    options?: ChannelOptions,
    stateOptions?: ChannelStateOptions,
  ) => Promise<Array<Channel<OneChatGenerics>>>;

  /**
   * queryUsers - Query users and watch user presence
   *
   * @param {UserFilters<OneChatGenerics>} filterConditions MongoDB style filter conditions
   * @param {UserSort<OneChatGenerics>} sort Sort options, for instance [{last_active: -1}].
   * When using multiple fields, make sure you use array of objects to guarantee field order, for instance [{last_active: -1}, {created_at: 1}]
   * @param {UserOptions} options Option object, {presence: true}
   *
   * @return {Promise<{ users: Array<UserResponse<OneChatGenerics>> }>} User Query Response
   */
  queryUsers: (
    filterConditions: UserFilters<OneChatGenerics>,
    sort?: UserSort<OneChatGenerics>,
    options?: UserOptions,
  ) => Promise<{ users: Array<UserResponse<OneChatGenerics>> }>;

  setUserAgent: (userAgent: string) => void;

  /**
   * unflagMessage - unflag a message
   * @param {string} targetMessageID
   * @param {string} [options.user_id] currentUserID, only used with serverside auth
   * @returns {Promise<APIResponse>}
   */
  unflagMessage: (targetMessageID: string, options?: { user_id?: string }) => Promise<APIResponse>;

  /**
   * updateMessage - Update the given message
   *
   * @param {Omit<MessageResponse<OneChatGenerics>, 'mentioned_users'> & { mentioned_users?: string[] }} message object, id needs to be specified
   * @param {string | { id: string }} [userId]
   * @param {boolean} [options.skip_enrich_url] Do not try to enrich the URLs within message
   *
   * @return {{ message: MessageResponse<OneChatGenerics> }} Response that includes the message
   */
  updateMessage: (
    message: UpdatedMessage<OneChatGenerics>,
    userId?: string | { id: string },
    options?: { skip_enrich_url?: boolean },
  ) => Promise<UpdateMessageAPIResponse<OneChatGenerics>>;

  userID?: string;

  user?: OwnUserResponse<OneChatGenerics> | UserResponse<OneChatGenerics>;

  baseURL?: string;

  /** unmuteUser - unmutes a user
   *
   * @param {string} targetID
   * @param {string} [currentUserID] Only used with serverside auth
   * @returns {Promise<APIResponse>}
   */
  unmuteUser: (targetID: string, currentUserID?: string) => Promise<APIResponse>;

  /**
   * unpinMessage - unpins the message that was previously pinned
   * @param {string | { id: string }} messageOrMessageId message object or message id
   * @param {string | { id: string }} [userId]
   */
  unpinMessage: (
    messageOrMessageId: string | { id: string },
    userId?: string | { id: string },
  ) => Promise<UpdateMessageAPIResponse<OneChatGenerics>>;
}
