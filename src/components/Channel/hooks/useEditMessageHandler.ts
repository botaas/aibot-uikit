import { useChatContext } from '../../../context/ChatContext';

import type { Client, UpdatedMessage, DefaultOneChatGenerics } from '../../../types';

type UpdateHandler<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = (
  cid: string,
  updatedMessage: UpdatedMessage<OneChatGenerics>,
) => ReturnType<Client<OneChatGenerics>['updateMessage']>;

export const useEditMessageHandler = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  doUpdateMessageRequest?: UpdateHandler<OneChatGenerics>,
) => {
  const { channel, client } = useChatContext<OneChatGenerics>('useEditMessageHandler');

  return (updatedMessage: UpdatedMessage<OneChatGenerics>) => {
    if (doUpdateMessageRequest && channel) {
      return Promise.resolve(doUpdateMessageRequest(channel.cid, updatedMessage));
    }
    return client.updateMessage(updatedMessage);
  };
};
