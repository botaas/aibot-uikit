import type { Channel, UserResponse, DefaultOneChatGenerics } from '../../types';

export type ChannelOrUserResponse<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = Channel<OneChatGenerics> | UserResponse<OneChatGenerics>;

export const isChannel = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  output: ChannelOrUserResponse<OneChatGenerics>,
): output is Channel<OneChatGenerics> => (output as Channel<OneChatGenerics>).cid != null;
