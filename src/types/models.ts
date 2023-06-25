import type { EVENT_MAP } from './events';

/**
 * Utility Types
 */

export type ArrayOneOrMore<T> = {
	0: T;
} & Array<T>;

export type ArrayTwoOrMore<T> = {
	0: T;
	1: T;
} & Array<T>;

export type KnownKeys<T> = {
	[K in keyof T]: string extends K ? never : number extends K ? never : K;
} extends { [_ in keyof T]: infer U }
	? U
	: never;

export type RequireAtLeastOne<T> = {
	[K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
	{
		[K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>;
	}[Keys];

/* Unknown Record */
export type UR = Record<string, unknown>;
export type UnknownType = UR; //alias to avoid breaking change

export type DefaultGenerics = {
	attachmentType: UR;
	channelType: UR;
	commandType: LiteralStringForUnion;
	eventType: UR;
	messageType: UR;
	reactionType: UR;
	userType: UR;
};

export type ExtendableGenerics = {
	attachmentType: UR;
	channelType: UR;
	commandType: string;
	eventType: UR;
	messageType: UR;
	reactionType: UR;
	userType: UR;
};

export type Unpacked<T> = T extends (infer U)[]
	? U // eslint-disable-next-line @typescript-eslint/no-explicit-any
	: T extends (...args: any[]) => infer U
	? U
	: T extends Promise<infer U>
	? U
	: T;

/**
 * Response Types
 */

export type APIResponse = {
	duration: string;
};

export type AppSettingsAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	app?: {
		// TODO
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		call_types: any;
		channel_configs: Record<
			string,
			{
				reminders: boolean;
				automod?: ChannelConfigAutomod;
				automod_behavior?: ChannelConfigAutomodBehavior;
				automod_thresholds?: ChannelConfigAutomodThresholds;
				blocklist_behavior?: ChannelConfigAutomodBehavior;
				commands?: CommandVariants<OneChatGenerics>[];
				connect_events?: boolean;
				created_at?: string;
				custom_events?: boolean;
				max_message_length?: number;
				message_retention?: string;
				mutes?: boolean;
				name?: string;
				push_notifications?: boolean;
				quotes?: boolean;
				reactions?: boolean;
				read_events?: boolean;
				replies?: boolean;
				search?: boolean;
				typing_events?: boolean;
				updated_at?: string;
				uploads?: boolean;
				url_enrichment?: boolean;
			}
		>;
		reminders_interval: number;
		agora_options?: AgoraOptions | null;
		async_moderation_config?: AsyncModerationOptions;
		async_url_enrich_enabled?: boolean;
		auto_translation_enabled?: boolean;
		before_message_send_hook_url?: string;
		campaign_enabled?: boolean;
		cdn_expiration_seconds?: number;
		custom_action_handler_url?: string;
		disable_auth_checks?: boolean;
		disable_permissions_checks?: boolean;
		enforce_unique_usernames?: 'no' | 'app' | 'team';
		file_upload_config?: FileUploadConfig;
		grants?: Record<string, string[]>;
		hms_options?: HMSOptions | null;
		image_moderation_enabled?: boolean;
		image_upload_config?: FileUploadConfig;
		multi_tenant_enabled?: boolean;
		name?: string;
		organization?: string;
		permission_version?: string;
		policies?: Record<string, Policy[]>;
		push_notifications?: {
			offline_only: boolean;
			version: string;
			apn?: APNConfig;
			firebase?: FirebaseConfig;
			huawei?: HuaweiConfig;
			providers?: PushProviderConfig[];
			xiaomi?: XiaomiConfig;
		};
		revoke_tokens_issued_before?: string | null;
		search_backend?: 'disabled' | 'elasticsearch' | 'postgres';
		sqs_key?: string;
		sqs_secret?: string;
		sqs_url?: string;
		suspended?: boolean;
		suspended_explanation?: string;
		user_search_disallowed_roles?: string[] | null;
		video_provider?: string;
		webhook_events?: Array<string>;
		webhook_url?: string;
	};
};

export type ModerationResult = {
	action: string;
	created_at: string;
	message_id: string;
	updated_at: string;
	user_bad_karma: boolean;
	user_karma: number;
	blocked_word?: string;
	blocklist_name?: string;
	moderated_by?: string;
};

export type AutomodDetails = {
	action?: string;
	image_labels?: Array<string>;
	original_message_type?: string;
	result?: ModerationResult;
};

export type FlagDetails = {
	automod?: AutomodDetails;
};

export type Flag<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	created_at: string;
	created_by_automod: boolean;
	updated_at: string;
	details?: FlagDetails;
	target_message?: MessageResponse<OneChatGenerics>;
	target_user?: UserResponse<OneChatGenerics>;
	user?: UserResponse<OneChatGenerics>;
};

export type FlagsResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	flags?: Array<Flag<OneChatGenerics>>;
};

export type MessageFlagsResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	flags?: Array<{
		message: MessageResponse<OneChatGenerics>;
		user: UserResponse<OneChatGenerics>;
		approved_at?: string;
		created_at?: string;
		created_by_automod?: boolean;
		moderation_result?: ModerationResult;
		rejected_at?: string;
		reviewed_at?: string;
		reviewed_by?: UserResponse<OneChatGenerics>;
		updated_at?: string;
	}>;
};

export type FlagReport<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	flags_count: number;
	id: string;
	message: MessageResponse<OneChatGenerics>;
	user: UserResponse<OneChatGenerics>;
	created_at?: string;
	details?: FlagDetails;
	first_reporter?: UserResponse<OneChatGenerics>;
	review_result?: string;
	reviewed_at?: string;
	reviewed_by?: UserResponse<OneChatGenerics>;
	updated_at?: string;
};

export type FlagReportsResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	flag_reports: Array<FlagReport<OneChatGenerics>>;
};

export type ReviewFlagReportResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	flag_report: FlagReport<OneChatGenerics>;
};

export type BannedUsersResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	bans?: Array<{
		user: UserResponse<OneChatGenerics>;
		banned_by?: UserResponse<OneChatGenerics>;
		channel?: ChannelResponse<OneChatGenerics>;
		expires?: string;
		ip_ban?: boolean;
		reason?: string;
		timeout?: number;
	}>;
};

export type BlockListResponse = BlockList & {
	created_at?: string;
	updated_at?: string;
};

export type ChannelResponse<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = OneChatGenerics['channelType'] & {
	cid: string;
	disabled: boolean;
	frozen: boolean;
	id: string;
	type: string;
	auto_translation_enabled?: boolean;
	auto_translation_language?: TranslationLanguages | '';
	config?: ChannelConfigWithInfo<OneChatGenerics>;
	cooldown?: number;
	created_at?: string;
	created_by?: UserResponse<OneChatGenerics> | null;
	created_by_id?: string;
	deleted_at?: string;
	hidden?: boolean;
	invites?: string[];
	joined?: boolean;
	last_message_at?: string;
	member_count?: number;
	members?: ChannelMemberResponse<OneChatGenerics>[];
	muted?: boolean;
	name?: string;
	own_capabilities?: string[];
	team?: string;
	truncated_at?: string;
	truncated_by?: UserResponse<OneChatGenerics>;
	truncated_by_id?: string;
	updated_at?: string;
};

export type QueryChannelsAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	channels: Omit<ChannelAPIResponse<OneChatGenerics>, keyof APIResponse>[];
};

export type QueryChannelAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse &
	ChannelAPIResponse<OneChatGenerics>;

export type ChannelAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	channel: ChannelResponse<OneChatGenerics>;
	members: ChannelMemberResponse<OneChatGenerics>[];
	messages: MessageResponse<OneChatGenerics>[];
	pinned_messages: MessageResponse<OneChatGenerics>[];
	hidden?: boolean;
	membership?: ChannelMembership<OneChatGenerics> | null;
	pending_messages?: PendingMessageResponse<OneChatGenerics>[];
	read?: ReadResponse<OneChatGenerics>[];
	watcher_count?: number;
	watchers?: UserResponse<OneChatGenerics>[];
};

export type ChannelUpdateOptions = {
	hide_history?: boolean;
	skip_push?: boolean;
};

export type ChannelMemberAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	members: ChannelMemberResponse<OneChatGenerics>[];
};

export type ChannelMemberResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	banned?: boolean;
	channel_role?: Role;
	created_at?: string;
	invite_accepted_at?: string;
	invite_rejected_at?: string;
	invited?: boolean;
	is_moderator?: boolean;
	role?: string;
	shadow_banned?: boolean;
	updated_at?: string;
	user?: UserResponse<OneChatGenerics>;
	user_id?: string;
};

export type CheckPushResponse = APIResponse & {
	device_errors?: {
		[deviceID: string]: {
			error_message?: string;
			provider?: PushProvider;
			provider_name?: string;
		};
	};
	general_errors?: string[];
	rendered_apn_template?: string;
	rendered_firebase_template?: string;
	rendered_message?: {};
	skip_devices?: boolean;
};

export type CheckSQSResponse = APIResponse & {
	status: string;
	data?: {};
	error?: string;
};

export type CommandResponse<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = Partial<CreatedAtUpdatedAt> & {
	args?: string;
	description?: string;
	name?: CommandVariants<OneChatGenerics>;
	set?: CommandVariants<OneChatGenerics>;
};

export type ConnectAPIResponse<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = Promise<void | ConnectionOpen<OneChatGenerics>>;

export type CreateChannelResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse &
	Omit<CreateChannelOptions<OneChatGenerics>, 'client_id' | 'connection_id'> & {
		created_at: string;
		updated_at: string;
		grants?: Record<string, string[]>;
	};

export type CreateCommandResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	command: CreateCommandOptions<OneChatGenerics> & CreatedAtUpdatedAt;
};

export type DeleteChannelAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	channel: ChannelResponse<OneChatGenerics>;
};

export type DeleteCommandResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	name?: CommandVariants<OneChatGenerics>;
};

export type EventAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	event: Event<OneChatGenerics>;
};

export type ExportChannelResponse = {
	task_id: string;
};

export type ExportUsersResponse = {
	task_id: string;
};

export type ExportChannelStatusResponse = {
	created_at?: string;
	error?: {};
	result?: {};
	updated_at?: string;
};

export type FlagMessageResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	flag: {
		created_at: string;
		created_by_automod: boolean;
		target_message_id: string;
		updated_at: string;
		user: UserResponse<OneChatGenerics>;
		approved_at?: string;
		channel_cid?: string;
		details?: Object; // Any JSON
		message_user_id?: string;
		rejected_at?: string;
		reviewed_at?: string;
		reviewed_by?: string;
	};
};

export type FlagUserResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	flag: {
		created_at: string;
		created_by_automod: boolean;
		target_user: UserResponse<OneChatGenerics>;
		updated_at: string;
		user: UserResponse<OneChatGenerics>;
		approved_at?: string;
		details?: Object; // Any JSON
		rejected_at?: string;
		reviewed_at?: string;
		reviewed_by?: string;
	};
};

export type FormatMessageResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = Omit<
	MessageResponse<{
		attachmentType: OneChatGenerics['attachmentType'];
		channelType: OneChatGenerics['channelType'];
		commandType: OneChatGenerics['commandType'];
		eventType: OneChatGenerics['eventType'];
		messageType: {};
		reactionType: OneChatGenerics['reactionType'];
		userType: OneChatGenerics['userType'];
	}>,
	'created_at' | 'pinned_at' | 'updated_at' | 'status'
> &
	OneChatGenerics['messageType'] & {
		created_at: Date;
		pinned_at: Date | null;
		status: string;
		updated_at: Date;
	};

export type GetChannelTypeResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse &
	Omit<CreateChannelOptions<OneChatGenerics>, 'client_id' | 'connection_id' | 'commands'> & {
		created_at: string;
		updated_at: string;
		commands?: CommandResponse<OneChatGenerics>[];
		grants?: Record<string, string[]>;
	};

export type GetCommandResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse &
	CreateCommandOptions<OneChatGenerics> &
	CreatedAtUpdatedAt;

export type GetMessageAPIResponse<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = SendMessageAPIResponse<OneChatGenerics>;

export type GetMultipleMessagesAPIResponse<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = APIResponse & {
	messages: MessageResponse<OneChatGenerics>[];
};

export type GetRateLimitsResponse = APIResponse & {
	android?: RateLimitsMap;
	ios?: RateLimitsMap;
	server_side?: RateLimitsMap;
	web?: RateLimitsMap;
};

export type GetReactionsAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	reactions: ReactionResponse<OneChatGenerics>[];
};

export type GetRepliesAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	messages: MessageResponse<OneChatGenerics>[];
};

export type GetUnreadCountAPIResponse = APIResponse & {
	channel_type: {
		channel_count: number;
		channel_type: string;
		unread_count: number;
	}[];
	channels: {
		channel_id: string;
		last_read: string;
		unread_count: number;
	}[];
	total_unread_count: number;
};

export type ListChannelResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	channel_types: Record<
		string,
		Omit<CreateChannelOptions<OneChatGenerics>, 'client_id' | 'connection_id' | 'commands'> & {
			commands: CommandResponse<OneChatGenerics>[];
			created_at: string;
			updated_at: string;
			grants?: Record<string, string[]>;
		}
	>;
};

export type ListChannelTypesAPIResponse<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = ListChannelResponse<OneChatGenerics>;

export type ListCommandsResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	commands: Array<CreateCommandOptions<OneChatGenerics> & Partial<CreatedAtUpdatedAt>>;
};

export type MuteChannelAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	channel_mute: ChannelMute<OneChatGenerics>;
	own_user: OwnUserResponse<OneChatGenerics>;
	channel_mutes?: ChannelMute<OneChatGenerics>[];
	mute?: MuteResponse<OneChatGenerics>;
};

export type MessageResponse<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = MessageResponseBase<OneChatGenerics> & {
	quoted_message?: MessageResponseBase<OneChatGenerics>;
};

export type MessageResponseBase<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = MessageBase<OneChatGenerics> & {
	type: MessageLabel;
	args?: string;
	channel?: ChannelResponse<OneChatGenerics>;
	cid?: string;
	command?: string;
	command_info?: { name?: string };
	created_at?: string;
	deleted_at?: string;
	i18n?: RequireAtLeastOne<Record<`${TranslationLanguages}_text`, string>> & {
		language: TranslationLanguages;
	};
	latest_reactions?: ReactionResponse<OneChatGenerics>[];
	mentioned_users?: UserResponse<OneChatGenerics>[];
	own_reactions?: ReactionResponse<OneChatGenerics>[] | null;
	pin_expires?: string | null;
	pinned_at?: string | null;
	pinned_by?: UserResponse<OneChatGenerics> | null;
	reaction_counts?: { [key: string]: number } | null;
	reaction_scores?: { [key: string]: number } | null;
	reply_count?: number;
	shadowed?: boolean;
	silent?: boolean;
	status?: string;
	thread_participants?: UserResponse<OneChatGenerics>[];
	updated_at?: string;
};

export type MuteResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	user: UserResponse<OneChatGenerics>;
	created_at?: string;
	expires?: string;
	target?: UserResponse<OneChatGenerics>;
	updated_at?: string;
};

export type MuteUserResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	mute?: MuteResponse<OneChatGenerics>;
	mutes?: Array<Mute<OneChatGenerics>>;
	own_user?: OwnUserResponse<OneChatGenerics>;
};

export type OwnUserBase<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	channel_mutes: ChannelMute<OneChatGenerics>[];
	devices: Device<OneChatGenerics>[];
	mutes: Mute<OneChatGenerics>[];
	total_unread_count: number;
	unread_channels: number;
	unread_count: number;
	invisible?: boolean;
	roles?: string[];
};

export type OwnUserResponse<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = UserResponse<OneChatGenerics> & OwnUserBase<OneChatGenerics>;

export type PartialUpdateChannelAPIResponse<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = APIResponse & {
	channel: ChannelResponse<OneChatGenerics>;
	members: ChannelMemberResponse<OneChatGenerics>[];
};

export type PermissionAPIResponse = APIResponse & {
	permission?: PermissionAPIObject;
};

export type PermissionsAPIResponse = APIResponse & {
	permissions?: PermissionAPIObject[];
};

export type ReactionAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	message: MessageResponse<OneChatGenerics>;
	reaction: ReactionResponse<OneChatGenerics>;
};

export type ReactionResponse<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = Reaction<OneChatGenerics> & {
	created_at: string;
	message_id: string;
	updated_at: string;
};

export type ReadResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	last_read: string;
	user: UserResponse<OneChatGenerics>;
	last_read_message_id?: string;
	unread_messages?: number;
};

export type SearchAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	results: {
		message: MessageResponse<OneChatGenerics>;
	}[];
	next?: string;
	previous?: string;
	results_warning?: SearchWarning | null;
};

export type SearchWarning = {
	channel_search_cids: string[];
	channel_search_count: number;
	warning_code: number;
	warning_description: string;
};

// Thumb URL(thumb_url) is added considering video attachments as the backend will return the thumbnail in the response.
export type SendFileAPIResponse = APIResponse & { file: string; thumb_url?: string };

export type SendMessageAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	message: MessageResponse<OneChatGenerics>;
	pending_message_metadata?: Record<string, string> | null;
};

export type SyncResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	events: Event<OneChatGenerics>[];
	inaccessible_cids?: string[];
};

export type TruncateChannelAPIResponse<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = APIResponse & {
	channel: ChannelResponse<OneChatGenerics>;
	message?: MessageResponse<OneChatGenerics>;
};

export type UpdateChannelAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	channel: ChannelResponse<OneChatGenerics>;
	members: ChannelMemberResponse<OneChatGenerics>[];
	message?: MessageResponse<OneChatGenerics>;
};

export type UpdateChannelResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse &
	Omit<CreateChannelOptions<OneChatGenerics>, 'client_id' | 'connection_id'> & {
		created_at: string;
		updated_at: string;
	};

export type UpdateCommandResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	command: UpdateCommandOptions<OneChatGenerics> &
	CreatedAtUpdatedAt & {
		name: CommandVariants<OneChatGenerics>;
	};
};

export type UpdateMessageAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	message: MessageResponse<OneChatGenerics>;
};

export type UsersAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	users: Array<UserResponse<OneChatGenerics>>;
};

export type UpdateUsersAPIResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = APIResponse & {
	users: { [key: string]: UserResponse<OneChatGenerics> };
};

export type UserResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = User<OneChatGenerics> & {
	banned?: boolean;
	created_at?: string;
	deactivated_at?: string;
	deleted_at?: string;
	language?: TranslationLanguages | '';
	last_active?: string;
	online?: boolean;
	push_notifications?: PushNotificationSettings;
	revoke_tokens_issued_before?: string;
	shadow_banned?: boolean;
	updated_at?: string;
};

export type PushNotificationSettings = {
	disabled?: boolean;
	disabled_until?: string | null;
};

/**
 * Option Types
 */

export type MessageFlagsPaginationOptions = {
	limit?: number;
	offset?: number;
};

export type FlagsPaginationOptions = {
	limit?: number;
	offset?: number;
};

export type FlagReportsPaginationOptions = {
	limit?: number;
	offset?: number;
};

export type ReviewFlagReportOptions = {
	review_details?: Object;
	user_id?: string;
};

export type BannedUsersPaginationOptions = Omit<PaginationOptions, 'id_gt' | 'id_gte' | 'id_lt' | 'id_lte'>;

export type BanUserOptions<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = UnBanUserOptions & {
	banned_by?: UserResponse<OneChatGenerics>;
	banned_by_id?: string;
	ip_ban?: boolean;
	reason?: string;
	timeout?: number;
};

export type ChannelOptions = {
	limit?: number;
	member_limit?: number;
	message_limit?: number;
	offset?: number;
	presence?: boolean;
	state?: boolean;
	user_id?: string;
	watch?: boolean;
};

export type ChannelQueryOptions<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	client_id?: string;
	connection_id?: string;
	data?: ChannelResponse<OneChatGenerics>;
	hide_for_creator?: boolean;
	members?: PaginationOptions;
	messages?: MessagePaginationOptions;
	presence?: boolean;
	state?: boolean;
	watch?: boolean;
	watchers?: PaginationOptions;
};

export type ChannelStateOptions = {
	offlineMode?: boolean;
	skipInitialization?: string[];
};

export type CreateChannelOptions<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	automod?: ChannelConfigAutomod;
	automod_behavior?: ChannelConfigAutomodBehavior;
	automod_thresholds?: ChannelConfigAutomodThresholds;
	blocklist?: string;
	blocklist_behavior?: ChannelConfigAutomodBehavior;
	client_id?: string;
	commands?: CommandVariants<OneChatGenerics>[];
	connect_events?: boolean;
	connection_id?: string;
	custom_events?: boolean;
	grants?: Record<string, string[]>;
	max_message_length?: number;
	message_retention?: string;
	mutes?: boolean;
	name?: string;
	permissions?: PermissionObject[];
	push_notifications?: boolean;
	quotes?: boolean;
	reactions?: boolean;
	read_events?: boolean;
	reminders?: boolean;
	replies?: boolean;
	search?: boolean;
	typing_events?: boolean;
	uploads?: boolean;
	url_enrichment?: boolean;
};

export type CreateCommandOptions<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	description: string;
	name: CommandVariants<OneChatGenerics>;
	args?: string;
	set?: CommandVariants<OneChatGenerics>;
};

export type CustomPermissionOptions = {
	action: string;
	condition: object;
	id: string;
	name: string;
	description?: string;
	owner?: boolean;
	same_team?: boolean;
};

export type DeactivateUsersOptions = {
	created_by_id?: string;
	mark_messages_deleted?: boolean;
};

// TODO: rename to UpdateChannelOptions in the next major update and use it in channel._update and/or channel.update
export type InviteOptions<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	accept_invite?: boolean;
	add_members?: string[];
	add_moderators?: string[];
	client_id?: string;
	connection_id?: string;
	data?: Omit<ChannelResponse<OneChatGenerics>, 'id' | 'cid'>;
	demote_moderators?: string[];
	invites?: string[];
	message?: MessageResponse<OneChatGenerics>;
	reject_invite?: boolean;
	remove_members?: string[];
	user?: UserResponse<OneChatGenerics>;
	user_id?: string;
};

/** @deprecated use MarkChannelsReadOptions instead */
export type MarkAllReadOptions<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = MarkChannelsReadOptions<OneChatGenerics>;

export type MarkChannelsReadOptions<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	client_id?: string;
	connection_id?: string;
	read_by_channel?: Record<string, string>;
	user?: UserResponse<OneChatGenerics>;
	user_id?: string;
};

export type MarkReadOptions<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	client_id?: string;
	connection_id?: string;
	user?: UserResponse<OneChatGenerics>;
	user_id?: string;
};

export type MarkUnreadOptions<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	message_id: string;
	client_id?: string;
	connection_id?: string;
	user?: UserResponse<OneChatGenerics>;
	user_id?: string;
};

export type MuteUserOptions<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	client_id?: string;
	connection_id?: string;
	id?: string;
	reason?: string;
	target_user_id?: string;
	timeout?: number;
	type?: string;
	user?: UserResponse<OneChatGenerics>;
	user_id?: string;
};

export type PaginationOptions = {
	created_at_after?: string | Date;
	created_at_after_or_equal?: string | Date;
	created_at_before?: string | Date;
	created_at_before_or_equal?: string | Date;
	id_gt?: string;
	id_gte?: string;
	id_lt?: string;
	id_lte?: string;
	limit?: number;
	offset?: number;
};

export type MessagePaginationOptions = PaginationOptions & {
	created_at_around?: string | Date;
	id_around?: string;
};

export type PinnedMessagePaginationOptions = {
	id_around?: string;
	id_gt?: string;
	id_gte?: string;
	id_lt?: string;
	id_lte?: string;
	limit?: number;
	offset?: number;
	pinned_at_after?: string | Date;
	pinned_at_after_or_equal?: string | Date;
	pinned_at_around?: string | Date;
	pinned_at_before?: string | Date;
	pinned_at_before_or_equal?: string | Date;
};

export type QueryMembersOptions = {
	limit?: number;
	offset?: number;
	user_id_gt?: string;
	user_id_gte?: string;
	user_id_lt?: string;
	user_id_lte?: string;
};

export type ReactivateUserOptions = {
	created_by_id?: string;
	name?: string;
	restore_messages?: boolean;
};

export type ReactivateUsersOptions = {
	created_by_id?: string;
	restore_messages?: boolean;
};

export type SearchOptions<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	limit?: number;
	next?: string;
	offset?: number;
	sort?: SearchMessageSort<OneChatGenerics>;
};

export type SyncOptions = {
	/**
	 * This will behave as queryChannels option.
	 */
	watch?: boolean;
	/**
	 * Return channels from request that user does not have access to in a separate
	 * field in the response called 'inaccessible_cids' instead of
	 * adding them as 'notification.removed_from_channel' events.
	 */
	with_inaccessible_cids?: boolean;
};

export type UnBanUserOptions = {
	client_id?: string;
	connection_id?: string;
	id?: string;
	shadow?: boolean;
	target_user_id?: string;
	type?: string;
};

// TODO: rename to UpdateChannelTypeOptions in the next major update
export type UpdateChannelOptions<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = Omit<
	CreateChannelOptions<OneChatGenerics>,
	'name'
> & {
	created_at?: string;
	updated_at?: string;
};

export type UpdateCommandOptions<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	description: string;
	args?: string;
	set?: CommandVariants<OneChatGenerics>;
};

export type UserOptions = {
	limit?: number;
	offset?: number;
	presence?: boolean;
};

/**
 * Event Types
 */

export type ConnectionChangeEvent = {
	type: EventTypes;
	online?: boolean;
};

export type Event<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = OneChatGenerics['eventType'] & {
	type: EventTypes;
	channel?: ChannelResponse<OneChatGenerics>;
	channel_id?: string;
	channel_type?: string;
	cid?: string;
	clear_history?: boolean;
	connection_id?: string;
	created_at?: string;
	hard_delete?: boolean;
	mark_messages_deleted?: boolean;
	me?: OwnUserResponse<OneChatGenerics>;
	member?: ChannelMemberResponse<OneChatGenerics>;
	message?: MessageResponse<OneChatGenerics>;
	mode?: string;
	online?: boolean;
	parent_id?: string;
	queriedChannels?: {
		channels: ChannelAPIResponse<OneChatGenerics>[];
		isLatestMessageSet?: boolean;
	};
	reaction?: ReactionResponse<OneChatGenerics>;
	received_at?: string | Date;
	team?: string;
	total_unread_count?: number;
	unread_channels?: number;
	unread_count?: number;
	user?: UserResponse<OneChatGenerics>;
	user_id?: string;
	watcher_count?: number;
};

export type UserCustomEvent<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = OneChatGenerics['eventType'] & {
	type: string;
};

export type EventHandler<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = (
	event: Event<OneChatGenerics>,
) => void;

export type EventTypes = 'all' | keyof typeof EVENT_MAP;

/**
 * Filter Types
 */

export type AscDesc = 1 | -1;

export type MessageFlagsFiltersOptions = {
	channel_cid?: string;
	is_reviewed?: boolean;
	team?: string;
	user_id?: string;
};

export type MessageFlagsFilters = QueryFilters<
	{
		channel_cid?:
		| RequireOnlyOne<Pick<QueryFilter<MessageFlagsFiltersOptions['channel_cid']>, '$eq' | '$in'>>
		| PrimitiveFilter<MessageFlagsFiltersOptions['channel_cid']>;
	} & {
		team?:
		| RequireOnlyOne<Pick<QueryFilter<MessageFlagsFiltersOptions['team']>, '$eq' | '$in'>>
		| PrimitiveFilter<MessageFlagsFiltersOptions['team']>;
	} & {
		user_id?:
		| RequireOnlyOne<Pick<QueryFilter<MessageFlagsFiltersOptions['user_id']>, '$eq' | '$in'>>
		| PrimitiveFilter<MessageFlagsFiltersOptions['user_id']>;
	} & {
		[Key in keyof Omit<MessageFlagsFiltersOptions, 'channel_cid' | 'user_id' | 'is_reviewed'>]:
		| RequireOnlyOne<QueryFilter<MessageFlagsFiltersOptions[Key]>>
		| PrimitiveFilter<MessageFlagsFiltersOptions[Key]>;
	}
>;

export type FlagsFiltersOptions = {
	channel_cid?: string;
	message_id?: string;
	message_user_id?: string;
	reporter_id?: string;
	team?: string;
	user_id?: string;
};

export type FlagsFilters = QueryFilters<
	{
		user_id?:
		| RequireOnlyOne<Pick<QueryFilter<FlagsFiltersOptions['user_id']>, '$eq' | '$in'>>
		| PrimitiveFilter<FlagsFiltersOptions['user_id']>;
	} & {
		message_id?:
		| RequireOnlyOne<Pick<QueryFilter<FlagsFiltersOptions['message_id']>, '$eq' | '$in'>>
		| PrimitiveFilter<FlagsFiltersOptions['message_id']>;
	} & {
		message_user_id?:
		| RequireOnlyOne<Pick<QueryFilter<FlagsFiltersOptions['message_user_id']>, '$eq' | '$in'>>
		| PrimitiveFilter<FlagsFiltersOptions['message_user_id']>;
	} & {
		channel_cid?:
		| RequireOnlyOne<Pick<QueryFilter<FlagsFiltersOptions['channel_cid']>, '$eq' | '$in'>>
		| PrimitiveFilter<FlagsFiltersOptions['channel_cid']>;
	} & {
		reporter_id?:
		| RequireOnlyOne<Pick<QueryFilter<FlagsFiltersOptions['reporter_id']>, '$eq' | '$in'>>
		| PrimitiveFilter<FlagsFiltersOptions['reporter_id']>;
	} & {
		team?:
		| RequireOnlyOne<Pick<QueryFilter<FlagsFiltersOptions['team']>, '$eq' | '$in'>>
		| PrimitiveFilter<FlagsFiltersOptions['team']>;
	}
>;

export type FlagReportsFiltersOptions = {
	channel_cid?: string;
	is_reviewed?: boolean;
	message_id?: string;
	message_user_id?: string;
	report_id?: string;
	review_result?: string;
	reviewed_by?: string;
	team?: string;
	user_id?: string;
};

export type FlagReportsFilters = QueryFilters<
	{
		report_id?:
		| RequireOnlyOne<Pick<QueryFilter<FlagReportsFiltersOptions['report_id']>, '$eq' | '$in'>>
		| PrimitiveFilter<FlagReportsFiltersOptions['report_id']>;
	} & {
		review_result?:
		| RequireOnlyOne<Pick<QueryFilter<FlagReportsFiltersOptions['review_result']>, '$eq' | '$in'>>
		| PrimitiveFilter<FlagReportsFiltersOptions['review_result']>;
	} & {
		reviewed_by?:
		| RequireOnlyOne<Pick<QueryFilter<FlagReportsFiltersOptions['reviewed_by']>, '$eq' | '$in'>>
		| PrimitiveFilter<FlagReportsFiltersOptions['reviewed_by']>;
	} & {
		user_id?:
		| RequireOnlyOne<Pick<QueryFilter<FlagReportsFiltersOptions['user_id']>, '$eq' | '$in'>>
		| PrimitiveFilter<FlagReportsFiltersOptions['user_id']>;
	} & {
		message_id?:
		| RequireOnlyOne<Pick<QueryFilter<FlagReportsFiltersOptions['message_id']>, '$eq' | '$in'>>
		| PrimitiveFilter<FlagReportsFiltersOptions['message_id']>;
	} & {
		message_user_id?:
		| RequireOnlyOne<Pick<QueryFilter<FlagReportsFiltersOptions['message_user_id']>, '$eq' | '$in'>>
		| PrimitiveFilter<FlagReportsFiltersOptions['message_user_id']>;
	} & {
		channel_cid?:
		| RequireOnlyOne<Pick<QueryFilter<FlagReportsFiltersOptions['channel_cid']>, '$eq' | '$in'>>
		| PrimitiveFilter<FlagReportsFiltersOptions['channel_cid']>;
	} & {
		team?:
		| RequireOnlyOne<Pick<QueryFilter<FlagReportsFiltersOptions['team']>, '$eq' | '$in'>>
		| PrimitiveFilter<FlagReportsFiltersOptions['team']>;
	} & {
		[Key in keyof Omit<
			FlagReportsFiltersOptions,
			'report_id' | 'user_id' | 'message_id' | 'review_result' | 'reviewed_by'
		>]: RequireOnlyOne<QueryFilter<FlagReportsFiltersOptions[Key]>> | PrimitiveFilter<FlagReportsFiltersOptions[Key]>;
	}
>;

export type BannedUsersFilterOptions = {
	banned_by_id?: string;
	channel_cid?: string;
	created_at?: string;
	reason?: string;
	user_id?: string;
};

export type BannedUsersFilters = QueryFilters<
	{
		channel_cid?:
		| RequireOnlyOne<Pick<QueryFilter<BannedUsersFilterOptions['channel_cid']>, '$eq' | '$in'>>
		| PrimitiveFilter<BannedUsersFilterOptions['channel_cid']>;
	} & {
		reason?:
		| RequireOnlyOne<
			{
				$autocomplete?: BannedUsersFilterOptions['reason'];
			} & QueryFilter<BannedUsersFilterOptions['reason']>
		>
		| PrimitiveFilter<BannedUsersFilterOptions['reason']>;
	} & {
		[Key in keyof Omit<BannedUsersFilterOptions, 'channel_cid' | 'reason'>]:
		| RequireOnlyOne<QueryFilter<BannedUsersFilterOptions[Key]>>
		| PrimitiveFilter<BannedUsersFilterOptions[Key]>;
	}
>;

export type ChannelFilters<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = QueryFilters<
	ContainsOperator<OneChatGenerics['channelType']> & {
		members?:
		| RequireOnlyOne<Pick<QueryFilter<string>, '$in' | '$nin'>>
		| RequireOnlyOne<Pick<QueryFilter<string[]>, '$eq'>>
		| PrimitiveFilter<string[]>;
	} & {
		name?:
		| RequireOnlyOne<
			{
				$autocomplete?: ChannelResponse<OneChatGenerics>['name'];
			} & QueryFilter<ChannelResponse<OneChatGenerics>['name']>
		>
		| PrimitiveFilter<ChannelResponse<OneChatGenerics>['name']>;
	} & {
		[Key in keyof Omit<
			ChannelResponse<{
				attachmentType: OneChatGenerics['attachmentType'];
				channelType: {};
				commandType: OneChatGenerics['commandType'];
				eventType: OneChatGenerics['eventType'];
				messageType: OneChatGenerics['messageType'];
				reactionType: OneChatGenerics['reactionType'];
				userType: OneChatGenerics['userType'];
			}>,
			'name' | 'members'
		>]:
		| RequireOnlyOne<
			QueryFilter<
				ChannelResponse<{
					attachmentType: OneChatGenerics['attachmentType'];
					channelType: {};
					commandType: OneChatGenerics['commandType'];
					eventType: OneChatGenerics['eventType'];
					messageType: OneChatGenerics['messageType'];
					reactionType: OneChatGenerics['reactionType'];
					userType: OneChatGenerics['userType'];
				}>[Key]
			>
		>
		| PrimitiveFilter<
			ChannelResponse<{
				attachmentType: OneChatGenerics['attachmentType'];
				channelType: {};
				commandType: OneChatGenerics['commandType'];
				eventType: OneChatGenerics['eventType'];
				messageType: OneChatGenerics['messageType'];
				reactionType: OneChatGenerics['reactionType'];
				userType: OneChatGenerics['userType'];
			}>[Key]
		>;
	}
>;

export type ContainsOperator<CustomType = {}> = {
	[Key in keyof CustomType]?: CustomType[Key] extends (infer ContainType)[]
	?
	| RequireOnlyOne<
		{
			$contains?: ContainType extends object
			? PrimitiveFilter<RequireAtLeastOne<ContainType>>
			: PrimitiveFilter<ContainType>;
		} & QueryFilter<PrimitiveFilter<ContainType>[]>
	>
	| PrimitiveFilter<PrimitiveFilter<ContainType>[]>
	: RequireOnlyOne<QueryFilter<CustomType[Key]>> | PrimitiveFilter<CustomType[Key]>;
};

export type MessageFilters<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = QueryFilters<
	ContainsOperator<OneChatGenerics['messageType']> & {
		text?:
		| RequireOnlyOne<
			{
				$autocomplete?: MessageResponse<OneChatGenerics>['text'];
				$q?: MessageResponse<OneChatGenerics>['text'];
			} & QueryFilter<MessageResponse<OneChatGenerics>['text']>
		>
		| PrimitiveFilter<MessageResponse<OneChatGenerics>['text']>;
	} & {
		[Key in keyof Omit<
			MessageResponse<{
				attachmentType: OneChatGenerics['attachmentType'];
				channelType: OneChatGenerics['channelType'];
				commandType: OneChatGenerics['commandType'];
				eventType: OneChatGenerics['eventType'];
				messageType: {};
				reactionType: OneChatGenerics['reactionType'];
				userType: OneChatGenerics['userType'];
			}>,
			'text'
		>]?:
		| RequireOnlyOne<
			QueryFilter<
				MessageResponse<{
					attachmentType: OneChatGenerics['attachmentType'];
					channelType: OneChatGenerics['channelType'];
					commandType: OneChatGenerics['commandType'];
					eventType: OneChatGenerics['eventType'];
					messageType: {};
					reactionType: OneChatGenerics['reactionType'];
					userType: OneChatGenerics['userType'];
				}>[Key]
			>
		>
		| PrimitiveFilter<
			MessageResponse<{
				attachmentType: OneChatGenerics['attachmentType'];
				channelType: OneChatGenerics['channelType'];
				commandType: OneChatGenerics['commandType'];
				eventType: OneChatGenerics['eventType'];
				messageType: {};
				reactionType: OneChatGenerics['reactionType'];
				userType: OneChatGenerics['userType'];
			}>[Key]
		>;
	}
>;

export type PrimitiveFilter<ObjectType> = ObjectType | null;

export type QueryFilter<ObjectType = string> = NonNullable<ObjectType> extends string | number | boolean
	? {
		$eq?: PrimitiveFilter<ObjectType>;
		$exists?: boolean;
		$gt?: PrimitiveFilter<ObjectType>;
		$gte?: PrimitiveFilter<ObjectType>;
		$in?: PrimitiveFilter<ObjectType>[];
		$lt?: PrimitiveFilter<ObjectType>;
		$lte?: PrimitiveFilter<ObjectType>;
		$ne?: PrimitiveFilter<ObjectType>;
		$nin?: PrimitiveFilter<ObjectType>[];
	}
	: {
		$eq?: PrimitiveFilter<ObjectType>;
		$exists?: boolean;
		$in?: PrimitiveFilter<ObjectType>[];
		$ne?: PrimitiveFilter<ObjectType>;
		$nin?: PrimitiveFilter<ObjectType>[];
	};

export type QueryFilters<Operators = {}> = {
	[Key in keyof Operators]?: Operators[Key];
} &
	QueryLogicalOperators<Operators>;

export type QueryLogicalOperators<Operators> = {
	$and?: ArrayOneOrMore<QueryFilters<Operators>>;
	$nor?: ArrayOneOrMore<QueryFilters<Operators>>;
	$or?: ArrayTwoOrMore<QueryFilters<Operators>>;
};

export type UserFilters<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = QueryFilters<
	ContainsOperator<OneChatGenerics['userType']> & {
		id?:
		| RequireOnlyOne<
			{ $autocomplete?: UserResponse<OneChatGenerics>['id'] } & QueryFilter<
				UserResponse<OneChatGenerics>['id']
			>
		>
		| PrimitiveFilter<UserResponse<OneChatGenerics>['id']>;
		name?:
		| RequireOnlyOne<
			{ $autocomplete?: UserResponse<OneChatGenerics>['name'] } & QueryFilter<
				UserResponse<OneChatGenerics>['name']
			>
		>
		| PrimitiveFilter<UserResponse<OneChatGenerics>['name']>;
		teams?:
		| RequireOnlyOne<{
			$contains?: PrimitiveFilter<string>;
			$eq?: PrimitiveFilter<UserResponse<OneChatGenerics>['teams']>;
		}>
		| PrimitiveFilter<UserResponse<OneChatGenerics>['teams']>;
		username?:
		| RequireOnlyOne<
			{ $autocomplete?: UserResponse<OneChatGenerics>['username'] } & QueryFilter<
				UserResponse<OneChatGenerics>['username']
			>
		>
		| PrimitiveFilter<UserResponse<OneChatGenerics>['username']>;
	} & {
		[Key in keyof Omit<
			UserResponse<{
				attachmentType: OneChatGenerics['attachmentType'];
				channelType: OneChatGenerics['channelType'];
				commandType: OneChatGenerics['commandType'];
				eventType: OneChatGenerics['eventType'];
				messageType: OneChatGenerics['messageType'];
				reactionType: OneChatGenerics['reactionType'];
				userType: {};
			}>,
			'id' | 'name' | 'teams' | 'username'
		>]?:
		| RequireOnlyOne<
			QueryFilter<
				UserResponse<{
					attachmentType: OneChatGenerics['attachmentType'];
					channelType: OneChatGenerics['channelType'];
					commandType: OneChatGenerics['commandType'];
					eventType: OneChatGenerics['eventType'];
					messageType: OneChatGenerics['messageType'];
					reactionType: OneChatGenerics['reactionType'];
					userType: {};
				}>[Key]
			>
		>
		| PrimitiveFilter<
			UserResponse<{
				attachmentType: OneChatGenerics['attachmentType'];
				channelType: OneChatGenerics['channelType'];
				commandType: OneChatGenerics['commandType'];
				eventType: OneChatGenerics['eventType'];
				messageType: OneChatGenerics['messageType'];
				reactionType: OneChatGenerics['reactionType'];
				userType: {};
			}>[Key]
		>;
	}
>;

/**
 * Sort Types
 */

export type BannedUsersSort = BannedUsersSortBase | Array<BannedUsersSortBase>;

export type BannedUsersSortBase = { created_at?: AscDesc };

export type ChannelSort<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> =
	| ChannelSortBase<OneChatGenerics>
	| Array<ChannelSortBase<OneChatGenerics>>;

export type ChannelSortBase<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = Sort<
	OneChatGenerics['channelType']
> & {
	created_at?: AscDesc;
	has_unread?: AscDesc;
	last_message_at?: AscDesc;
	last_updated?: AscDesc;
	member_count?: AscDesc;
	unread_count?: AscDesc;
	updated_at?: AscDesc;
};

export type PinnedMessagesSort = PinnedMessagesSortBase | Array<PinnedMessagesSortBase>;
export type PinnedMessagesSortBase = { pinned_at?: AscDesc };

export type Sort<T> = {
	[P in keyof T]?: AscDesc;
};

export type UserSort<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> =
	| Sort<UserResponse<OneChatGenerics>>
	| Array<Sort<UserResponse<OneChatGenerics>>>;

export type MemberSort<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> =
	| Sort<Pick<UserResponse<OneChatGenerics>, 'id' | 'created_at' | 'name'>>
	| Array<Sort<Pick<UserResponse<OneChatGenerics>, 'id' | 'created_at' | 'name'>>>;

export type SearchMessageSortBase<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = Sort<
	OneChatGenerics['messageType']
> & {
	attachments?: AscDesc;
	'attachments.type'?: AscDesc;
	created_at?: AscDesc;
	id?: AscDesc;
	'mentioned_users.id'?: AscDesc;
	parent_id?: AscDesc;
	pinned?: AscDesc;
	relevance?: AscDesc;
	reply_count?: AscDesc;
	text?: AscDesc;
	type?: AscDesc;
	updated_at?: AscDesc;
	'user.id'?: AscDesc;
};

export type SearchMessageSort<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> =
	| SearchMessageSortBase<OneChatGenerics>
	| Array<SearchMessageSortBase<OneChatGenerics>>;

export type QuerySort<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> =
	| BannedUsersSort
	| ChannelSort<OneChatGenerics>
	| SearchMessageSort<OneChatGenerics>
	| UserSort<OneChatGenerics>;

/**
 * Base Types
 */

export type Action = {
	name?: string;
	style?: string;
	text?: string;
	type?: string;
	value?: string;
};

export type AnonUserType = {};

export type APNConfig = {
	auth_key?: string;
	auth_type?: string;
	bundle_id?: string;
	development?: boolean;
	enabled?: boolean;
	host?: string;
	key_id?: string;
	notification_template?: string;
	p12_cert?: string;
	team_id?: string;
};

export type AgoraOptions = {
	app_certificate: string;
	app_id: string;
	role_map?: Record<string, string>;
};

export type HMSOptions = {
	app_access_key: string;
	app_secret: string;
	default_role: string;
	default_room_template: string;
	default_region?: string;
	role_map?: Record<string, string>;
};

export type AsyncModerationOptions = {
	callback?: {
		mode?: 'CALLBACK_MODE_NONE' | 'CALLBACK_MODE_REST' | 'CALLBACK_MODE_TWIRP';
		server_url?: string;
	};
	timeout_ms?: number;
};

export type AppSettings = {
	agora_options?: AgoraOptions | null;
	apn_config?: {
		auth_key?: string;
		auth_type?: string;
		bundle_id?: string;
		development?: boolean;
		host?: string;
		key_id?: string;
		notification_template?: string;
		p12_cert?: string;
		team_id?: string;
	};
	async_moderation_config?: AsyncModerationOptions;
	async_url_enrich_enabled?: boolean;
	auto_translation_enabled?: boolean;
	before_message_send_hook_url?: string;
	cdn_expiration_seconds?: number;
	custom_action_handler_url?: string;
	disable_auth_checks?: boolean;
	disable_permissions_checks?: boolean;
	enforce_unique_usernames?: 'no' | 'app' | 'team';
	// all possible file mime types are https://www.iana.org/assignments/media-types/media-types.xhtml
	file_upload_config?: FileUploadConfig;
	firebase_config?: {
		apn_template?: string;
		credentials_json?: string;
		data_template?: string;
		notification_template?: string;
		server_key?: string;
	};
	grants?: Record<string, string[]>;
	hms_options?: HMSOptions | null;
	huawei_config?: {
		id: string;
		secret: string;
	};
	image_moderation_enabled?: boolean;
	image_upload_config?: FileUploadConfig;
	migrate_permissions_to_v2?: boolean;
	multi_tenant_enabled?: boolean;
	permission_version?: 'v1' | 'v2';
	push_config?: {
		offline_only?: boolean;
		version?: string;
	};
	reminders_interval?: number;
	revoke_tokens_issued_before?: string | null;
	sqs_key?: string;
	sqs_secret?: string;
	sqs_url?: string;
	video_provider?: string;
	webhook_events?: Array<string> | null;
	webhook_url?: string;
	xiaomi_config?: {
		package_name: string;
		secret: string;
	};
};

export type Attachment<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = OneChatGenerics['attachmentType'] & {
	actions?: Action[];
	asset_url?: string;
	author_icon?: string;
	author_link?: string;
	author_name?: string;
	color?: string;
	fallback?: string;
	fields?: Field[];
	file_size?: number | string;
	footer?: string;
	footer_icon?: string;
	giphy?: GiphyData;
	image_url?: string;
	mime_type?: string;
	og_scrape_url?: string;
	original_height?: number;
	original_width?: number;
	pretext?: string;
	text?: string;
	thumb_url?: string;
	title?: string;
	title_link?: string;
	type?: string;
};

export type OGAttachment = {
	og_scrape_url: string;
	asset_url?: string; // og:video | og:audio
	author_link?: string; // og:site
	author_name?: string; // og:site_name
	image_url?: string; // og:image
	text?: string; // og:description
	thumb_url?: string; // og:image
	title?: string; // og:title
	title_link?: string; // og:url
	type?: string | 'video' | 'audio' | 'image';
};

export type BlockList = {
	name: string;
	words: string[];
};

export type ChannelConfig<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = ChannelConfigFields &
	CreatedAtUpdatedAt & {
		commands?: CommandVariants<OneChatGenerics>[];
	};

export type ChannelConfigAutomod = '' | 'AI' | 'disabled' | 'simple';

export type ChannelConfigAutomodBehavior = '' | 'block' | 'flag';

export type ChannelConfigAutomodThresholds = null | {
	explicit?: { block?: number; flag?: number };
	spam?: { block?: number; flag?: number };
	toxic?: { block?: number; flag?: number };
};

export type ChannelConfigFields = {
	reminders: boolean;
	automod?: ChannelConfigAutomod;
	automod_behavior?: ChannelConfigAutomodBehavior;
	automod_thresholds?: ChannelConfigAutomodThresholds;
	blocklist_behavior?: ChannelConfigAutomodBehavior;
	connect_events?: boolean;
	custom_events?: boolean;
	max_message_length?: number;
	message_retention?: string;
	mutes?: boolean;
	name?: string;
	push_notifications?: boolean;
	quotes?: boolean;
	reactions?: boolean;
	read_events?: boolean;
	replies?: boolean;
	search?: boolean;
	typing_events?: boolean;
	uploads?: boolean;
	url_enrichment?: boolean;
};

export type ChannelConfigWithInfo<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = ChannelConfigFields &
	CreatedAtUpdatedAt & {
		commands?: CommandResponse<OneChatGenerics>[];
	};

export type ChannelData<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = OneChatGenerics['channelType'] & {
	members?: string[];
	name?: string;
};

export type ChannelMembership<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	banned?: boolean;
	channel_role?: Role;
	created_at?: string;
	is_moderator?: boolean;
	role?: string;
	shadow_banned?: boolean;
	updated_at?: string;
	user?: UserResponse<OneChatGenerics>;
};

export type ChannelMute<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	user: UserResponse<OneChatGenerics>;
	channel?: ChannelResponse<OneChatGenerics>;
	created_at?: string;
	expires?: string;
	updated_at?: string;
};

export type ChannelRole = {
	custom?: boolean;
	name?: string;
	owner?: boolean;
	resource?: string;
	same_team?: boolean;
};

export type CheckPushInput<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	apn_template?: string;
	client_id?: string;
	connection_id?: string;
	firebase_data_template?: string;
	firebase_template?: string;
	message_id?: string;
	user?: UserResponse<OneChatGenerics>;
	user_id?: string;
};

export type PushProvider = 'apn' | 'firebase' | 'huawei' | 'xiaomi';

export type PushProviderConfig = PushProviderCommon &
	PushProviderID &
	PushProviderAPN &
	PushProviderFirebase &
	PushProviderHuawei &
	PushProviderXiaomi;

export type PushProviderID = {
	name: string;
	type: PushProvider;
};

export type PushProviderCommon = {
	created_at: string;
	updated_at: string;
	description?: string;
	disabled_at?: string;
	disabled_reason?: string;
};

export type PushProviderAPN = {
	apn_auth_key?: string;
	apn_auth_type?: 'token' | 'certificate';
	apn_development?: boolean;
	apn_host?: string;
	apn_key_id?: string;
	apn_notification_template?: string;
	apn_p12_cert?: string;
	apn_team_id?: string;
	apn_topic?: string;
};

export type PushProviderFirebase = {
	firebase_apn_template?: string;
	firebase_credentials?: string;
	firebase_data_template?: string;
	firebase_notification_template?: string;
	firebase_server_key?: string;
};

export type PushProviderHuawei = {
	huawei_app_id?: string;
	huawei_app_secret?: string;
};

export type PushProviderXiaomi = {
	xiaomi_package_name?: string;
	xiaomi_secret?: string;
};

export type CommandVariants<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> =
	| 'all'
	| 'ban'
	| 'fun_set'
	| 'giphy'
	| 'moderation_set'
	| 'mute'
	| 'unban'
	| 'unmute'
	| OneChatGenerics['commandType'];

export type Configs<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = Record<
	string,
	ChannelConfigWithInfo<OneChatGenerics> | undefined
>;

export type ConnectionOpen<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	connection_id: string;
	cid?: string;
	created_at?: string;
	me?: OwnUserResponse<OneChatGenerics>;
	type?: string;
};

export type CreatedAtUpdatedAt = {
	created_at: string;
	updated_at: string;
};

export type Device<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = DeviceFields & {
	provider?: string;
	user?: UserResponse<OneChatGenerics>;
	user_id?: string;
};

export type BaseDeviceFields = {
	id: string;
	push_provider: PushProvider;
	push_provider_name?: string;
};

export type DeviceFields = BaseDeviceFields & {
	created_at: string;
	disabled?: boolean;
	disabled_reason?: string;
};

export type EndpointName =
	| 'Connect'
	| 'LongPoll'
	| 'DeleteFile'
	| 'DeleteImage'
	| 'DeleteMessage'
	| 'DeleteUser'
	| 'DeleteUsers'
	| 'DeactivateUser'
	| 'ExportUser'
	| 'DeleteReaction'
	| 'UpdateChannel'
	| 'UpdateChannelPartial'
	| 'UpdateMessage'
	| 'UpdateMessagePartial'
	| 'GetMessage'
	| 'GetManyMessages'
	| 'UpdateUsers'
	| 'UpdateUsersPartial'
	| 'CreateGuest'
	| 'GetOrCreateChannel'
	| 'StopWatchingChannel'
	| 'QueryChannels'
	| 'Search'
	| 'QueryUsers'
	| 'QueryMembers'
	| 'QueryBannedUsers'
	| 'QueryFlags'
	| 'QueryMessageFlags'
	| 'GetReactions'
	| 'GetReplies'
	| 'GetPinnedMessages'
	| 'Ban'
	| 'Unban'
	| 'MuteUser'
	| 'MuteChannel'
	| 'UnmuteChannel'
	| 'UnmuteUser'
	| 'RunMessageAction'
	| 'SendEvent'
	| 'SendUserCustomEvent'
	| 'MarkRead'
	| 'MarkChannelsRead'
	| 'SendMessage'
	| 'ImportChannelMessages'
	| 'UploadFile'
	| 'UploadImage'
	| 'UpdateApp'
	| 'GetApp'
	| 'CreateDevice'
	| 'DeleteDevice'
	| 'SendReaction'
	| 'Flag'
	| 'Unflag'
	| 'Unblock'
	| 'QueryFlagReports'
	| 'FlagReportReview'
	| 'CreateChannelType'
	| 'DeleteChannel'
	| 'DeleteChannels'
	| 'DeleteChannelType'
	| 'GetChannelType'
	| 'ListChannelTypes'
	| 'ListDevices'
	| 'TruncateChannel'
	| 'UpdateChannelType'
	| 'CheckPush'
	| 'PrivateSubmitModeration'
	| 'ReactivateUser'
	| 'HideChannel'
	| 'ShowChannel'
	| 'CreatePermission'
	| 'UpdatePermission'
	| 'GetPermission'
	| 'DeletePermission'
	| 'ListPermissions'
	| 'CreateRole'
	| 'DeleteRole'
	| 'ListRoles'
	| 'ListCustomRoles'
	| 'Sync'
	| 'TranslateMessage'
	| 'CreateCommand'
	| 'GetCommand'
	| 'UpdateCommand'
	| 'DeleteCommand'
	| 'ListCommands'
	| 'CreateBlockList'
	| 'UpdateBlockList'
	| 'GetBlockList'
	| 'ListBlockLists'
	| 'DeleteBlockList'
	| 'ExportChannels'
	| 'GetExportChannelsStatus'
	| 'CheckSQS'
	| 'GetRateLimits'
	| 'CreateSegment'
	| 'GetSegment'
	| 'QuerySegments'
	| 'UpdateSegment'
	| 'DeleteSegment'
	| 'CreateCampaign'
	| 'GetCampaign'
	| 'ListCampaigns'
	| 'UpdateCampaign'
	| 'DeleteCampaign'
	| 'ScheduleCampaign'
	| 'StopCampaign'
	| 'ResumeCampaign'
	| 'TestCampaign'
	| 'GetOG'
	| 'GetTask'
	| 'ExportUsers'
	| 'CreateImport'
	| 'CreateImportURL'
	| 'GetImport'
	| 'ListImports'
	| 'UpsertPushProvider'
	| 'DeletePushProvider'
	| 'ListPushProviders';

export type ExportChannelRequest = {
	id: string;
	type: string;
	cid?: string;
	messages_since?: Date;
	messages_until?: Date;
};

export type ExportChannelOptions = {
	clear_deleted_message_text?: boolean;
	export_users?: boolean;
	include_truncated_messages?: boolean;
	version?: string;
};

export type ExportUsersRequest = {
	user_ids: string[];
};

export type Field = {
	short?: boolean;
	title?: string;
	value?: string;
};

export type FileUploadConfig = {
	allowed_file_extensions?: string[] | null;
	allowed_mime_types?: string[] | null;
	blocked_file_extensions?: string[] | null;
	blocked_mime_types?: string[] | null;
};

export type FirebaseConfig = {
	apn_template?: string;
	credentials_json?: string;
	data_template?: string;
	enabled?: boolean;
	notification_template?: string;
	server_key?: string;
};

type GiphyVersionInfo = {
	height: string;
	url: string;
	width: string;
};

type GiphyVersions =
	| 'original'
	| 'fixed_height'
	| 'fixed_height_still'
	| 'fixed_height_downsampled'
	| 'fixed_width'
	| 'fixed_width_still'
	| 'fixed_width_downsampled';

type GiphyData = {
	[key in GiphyVersions]: GiphyVersionInfo;
};

export type HuaweiConfig = {
	enabled?: boolean;
	id?: string;
	secret?: string;
};

export type XiaomiConfig = {
	enabled?: boolean;
	package_name?: string;
	secret?: string;
};

export type LiteralStringForUnion = string & {};

export type LogLevel = 'info' | 'error' | 'warn';

export type Logger = (logLevel: LogLevel, message: string, extraData?: Record<string, unknown>) => void;

export type Message<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = Partial<
	MessageBase<OneChatGenerics>
> & {
	mentioned_users?: string[];
};

export type MessageBase<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = OneChatGenerics['messageType'] & {
	id: string;
	attachments?: Attachment<OneChatGenerics>[];
	html?: string;
	mml?: string;
	parent_id?: string;
	pin_expires?: string | null;
	pinned?: boolean;
	pinned_at?: string | null;
	quoted_message_id?: string;
	show_in_channel?: boolean;
	text?: string;
	user?: UserResponse<OneChatGenerics> | null;
	user_id?: string;
};

export type MessageLabel = 'deleted' | 'ephemeral' | 'error' | 'regular' | 'reply' | 'system';

export type Mute<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	created_at: string;
	target: UserResponse<OneChatGenerics>;
	updated_at: string;
	user: UserResponse<OneChatGenerics>;
};

export type PartialUpdateChannel<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	set?: Partial<ChannelResponse<OneChatGenerics>>;
	unset?: Array<keyof ChannelResponse<OneChatGenerics>>;
};

export type PartialUserUpdate<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	id: string;
	set?: Partial<UserResponse<OneChatGenerics>>;
	unset?: Array<keyof UserResponse<OneChatGenerics>>;
};

export type MessageUpdatableFields<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = Omit<
	MessageResponse<OneChatGenerics>,
	'cid' | 'created_at' | 'updated_at' | 'deleted_at' | 'user' | 'user_id'
>;

export type PartialMessageUpdate<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	set?: Partial<MessageUpdatableFields<OneChatGenerics>>;
	unset?: Array<keyof MessageUpdatableFields<OneChatGenerics>>;
};

export type PendingMessageResponse<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	message: MessageResponse<OneChatGenerics>;
	pending_message_metadata?: Record<string, string>;
};

export type PermissionAPIObject = {
	action?: string;
	condition?: object;
	custom?: boolean;
	description?: string;
	id?: string;
	level?: string;
	name?: string;
	owner?: boolean;
	same_team?: boolean;
	tags?: string[];
};

export type PermissionObject = {
	action?: 'Deny' | 'Allow';
	name?: string;
	owner?: boolean;
	priority?: number;
	resources?: string[];
	roles?: string[];
};

export type Policy = {
	action?: 0 | 1;
	created_at?: string;
	name?: string;
	owner?: boolean;
	priority?: number;
	resources?: string[];
	roles?: string[] | null;
	updated_at?: string;
};

export type RateLimitsInfo = {
	limit: number;
	remaining: number;
	reset: number;
};

export type RateLimitsMap = Record<EndpointName, RateLimitsInfo>;

export type Reaction<
	OneChatGenerics extends ExtendableGenerics = DefaultGenerics
> = OneChatGenerics['reactionType'] & {
	type: string;
	message_id?: string;
	score?: number;
	user?: UserResponse<OneChatGenerics> | null;
	user_id?: string;
};

export type Resource =
	| 'AddLinks'
	| 'BanUser'
	| 'CreateChannel'
	| 'CreateMessage'
	| 'CreateReaction'
	| 'DeleteAttachment'
	| 'DeleteChannel'
	| 'DeleteMessage'
	| 'DeleteReaction'
	| 'EditUser'
	| 'MuteUser'
	| 'ReadChannel'
	| 'RunMessageAction'
	| 'UpdateChannel'
	| 'UpdateChannelMembers'
	| 'UpdateMessage'
	| 'UpdateUser'
	| 'UploadAttachment';

export type SearchPayload<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = Omit<
	SearchOptions<OneChatGenerics>,
	'sort'
> & {
	client_id?: string;
	connection_id?: string;
	filter_conditions?: ChannelFilters<OneChatGenerics>;
	message_filter_conditions?: MessageFilters<OneChatGenerics>;
	query?: string;
	sort?: Array<{
		direction: AscDesc;
		field: keyof SearchMessageSortBase<OneChatGenerics>;
	}>;
};

export type TestPushDataInput = {
	apnTemplate?: string;
	firebaseDataTemplate?: string;
	firebaseTemplate?: string;
	messageID?: string;
	pushProviderName?: string;
	pushProviderType?: PushProvider;
	skipDevices?: boolean;
};

export type TestSQSDataInput = {
	sqs_key?: string;
	sqs_secret?: string;
	sqs_url?: string;
};

export type TokenOrProvider = null | string | TokenProvider | undefined;

export type TokenProvider = () => Promise<string>;

export type TranslationLanguages =
	| ''
	| 'af'
	| 'am'
	| 'ar'
	| 'az'
	| 'bg'
	| 'bn'
	| 'bs'
	| 'cs'
	| 'da'
	| 'de'
	| 'el'
	| 'en'
	| 'es'
	| 'es-MX'
	| 'et'
	| 'fa'
	| 'fa-AF'
	| 'fi'
	| 'fr'
	| 'fr-CA'
	| 'ha'
	| 'he'
	| 'hi'
	| 'hr'
	| 'hu'
	| 'id'
	| 'it'
	| 'ja'
	| 'ka'
	| 'ko'
	| 'lv'
	| 'ms'
	| 'nl'
	| 'no'
	| 'pl'
	| 'ps'
	| 'pt'
	| 'ro'
	| 'ru'
	| 'sk'
	| 'sl'
	| 'so'
	| 'sq'
	| 'sr'
	| 'sv'
	| 'sw'
	| 'ta'
	| 'th'
	| 'tl'
	| 'tr'
	| 'uk'
	| 'ur'
	| 'vi'
	| 'zh'
	| 'zh-TW';

export type TypingStartEvent = Event;

export type ReservedMessageFields =
	| 'command'
	| 'created_at'
	| 'html'
	| 'latest_reactions'
	| 'own_reactions'
	| 'quoted_message'
	| 'reaction_counts'
	| 'reply_count'
	| 'type'
	| 'updated_at'
	| 'user'
	| '__html';

export type UpdatedMessage<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = Omit<
	MessageResponse<OneChatGenerics>,
	'mentioned_users'
> & { mentioned_users?: string[] };

export type User<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = OneChatGenerics['userType'] & {
	id: string;
	anon?: boolean;
	name?: string;
	role?: string;
	teams?: string[];
	username?: string;
};

export type TaskResponse = {
	task_id: string;
};

export type DeleteChannelsResponse = {
	result: Record<string, string>;
} & Partial<TaskResponse>;

export type DeleteType = 'soft' | 'hard';

/*
	DeleteUserOptions specifies a collection of one or more `user_ids` to be deleted.

	`user` soft|hard determines if the user needs to be hard- or soft-deleted, where hard-delete
	implies that all related objects (messages, flags, etc) will be hard-deleted as well.
	`conversations` soft|hard will delete any 1to1 channels that the user was a member of.
	`messages` soft-hard will delete any messages that the user has sent.
	`new_channel_owner_id` any channels owned by the hard-deleted user will be transferred to this user ID
 */
export type DeleteUserOptions = {
	user: DeleteType;
	conversations?: DeleteType;
	messages?: DeleteType;
	new_channel_owner_id?: string;
};

export type SegmentData = {
	description: string;
	filter: {};
	name: string;
	type: 'channel' | 'user';
};

export type Segment = {
	created_at: string;
	id: string;
	in_use: boolean;
	size: number;
	status: 'computing' | 'ready';
	updated_at: string;
} & SegmentData;

export type CampaignSortField = {
	field: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: any;
};

export type CampaignSort = {
	fields: CampaignSortField[];
	direction?: 'asc' | 'desc';
};

export type CampaignQueryOptions = {
	limit?: number;
	sort?: CampaignSort;
};

export type SegmentQueryOptions = CampaignQueryOptions;
export type RecipientQueryOptions = CampaignQueryOptions;

// TODO: add better typing
export type SegmentFilters = {};
export type CampaignFilters = {};
export type RecipientFilters = {};

export type CampaignData = {
	attachments: Attachment[];
	channel_type: string;
	defaults: Record<string, string>;
	name: string;
	segment_id: string;
	text: string;
	description?: string;
	sender_id?: string;
};

export type CampaignStatusName = 'draft' | 'stopped' | 'scheduled' | 'completed' | 'failed' | 'in_progress';

export type CampaignStatus = {
	status: CampaignStatusName;
	completed_at?: string;
	errored_messages?: number;
	failed_at?: string;
	resumed_at?: string;
	scheduled_at?: string;
	scheduled_for?: string;
	sent_messages?: number;
	stopped_at?: string;
	task_id?: string;
};

export type Campaign = {
	created_at: string;
	id: string;
	updated_at: string;
} & CampaignData &
	CampaignStatus;

export type TestCampaignResponse = {
	status: CampaignStatusName;
	details?: string;
	results?: Record<string, string>;
};

export type DeleteCampaignOptions = {
	recipients?: boolean;
};

export type Recipient = {
	campaign_id: string;
	channel_cid: string;
	created_at: string;
	status: 'pending' | 'sent' | 'failed';
	updated_at: string;
	details?: string;
	message_id?: string;
	receiver_id?: string;
};

export type TaskStatus = {
	created_at: string;
	status: string;
	task_id: string;
	updated_at: string;
	error?: {
		description: string;
		type: string;
	};
	result?: UR;
};

export type TruncateOptions<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	hard_delete?: boolean;
	message?: Message<OneChatGenerics>;
	skip_push?: boolean;
	truncated_at?: Date;
	user?: UserResponse<OneChatGenerics>;
	user_id?: string;
};

export type CreateImportURLResponse = {
	path: string;
	upload_url: string;
};

export type CreateImportResponse = {
	import_task: ImportTask;
};

export type GetImportResponse = {
	import_task: ImportTask;
};

export type CreateImportOptions = {
	mode: 'insert' | 'upsert';
};

export type ListImportsPaginationOptions = {
	limit?: number;
	offset?: number;
};

export type ListImportsResponse = {
	import_tasks: ImportTask[];
};

export type ImportTaskHistory = {
	created_at: string;
	next_state: string;
	prev_state: string;
};

export type ImportTask = {
	created_at: string;
	history: ImportTaskHistory[];
	id: string;
	path: string;
	state: string;
	updated_at: string;
	result?: UR;
	size?: number;
};

export type MessageSetType = 'latest' | 'current' | 'new';

export type PushProviderUpsertResponse = {
	push_provider: PushProvider;
};

export type PushProviderListResponse = {
	push_providers: PushProvider[];
};

export type CreateCallOptions<OneChatGenerics extends ExtendableGenerics = DefaultGenerics> = {
	id: string;
	type: string;
	options?: UR;
	user?: UserResponse<OneChatGenerics> | null;
	user_id?: string;
};

export type HMSCall = {
	room: string;
};

export type AgoraCall = {
	channel: string;
};

export type Call = {
	id: string;
	provider: string;
	agora?: AgoraCall;
	hms?: HMSCall;
};

export type CreateCallResponse = APIResponse & {
	call: Call;
	token: string;
	agora_app_id?: string;
	agora_uid?: number;
};

export type GetCallTokenResponse = APIResponse & {
	token: string;
	agora_app_id?: string;
	agora_uid?: number;
};

type ErrorResponseDetails = {
	code: number;
	messages: string[];
};

export type APIErrorResponse = {
	code: number;
	duration: string;
	message: string;
	more_info: string;
	StatusCode: number;
	details?: ErrorResponseDetails;
};

export class ErrorFromResponse<T> extends Error {
	code?: number;
	response?: {
		data: T;
		status: number;
		statusText: string;
		headers: Record<string, string>;
		request?: any;
	};
	status?: number;
}

export type Role = 'admin' | 'user' | 'guest' | 'anonymous' | 'channel_member' | 'channel_moderator' | string;