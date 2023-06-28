import { MutableRefObject, useLayoutEffect, useRef } from 'react';

import type { OneChatMessage } from '../../../context/ChannelStateContext';

import type { DefaultOneChatGenerics } from '../../../types';

export type UseAutoScrollToBottomParams<
	OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
	messages?: OneChatMessage<OneChatGenerics>[];
	scrollToBottom: () => void;
	atBottom: MutableRefObject<boolean>;
};

export function useAutoScrollToBottom<
	OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(params: UseAutoScrollToBottomParams<OneChatGenerics>) {
	const {
		scrollToBottom,
		atBottom,
	} = params;

	const messages = useRef<OneChatMessage<OneChatGenerics>[]>();

	useLayoutEffect(() => {
		const prevMessages = messages.current;
		const newMessages = params.messages;
		if (prevMessages && newMessages && prevMessages.length === newMessages.length) {
			if (atBottom.current) {
				scrollToBottom()
			}
		}
		messages.current = newMessages;
	}, [messages, params.messages, scrollToBottom, atBottom]);
}
