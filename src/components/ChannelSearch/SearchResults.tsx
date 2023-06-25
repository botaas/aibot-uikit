import React, { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';

import { SearchIcon } from './icons';
import { ChannelPreview } from '../ChannelPreview';
import { ChannelOrUserResponse, isChannel } from './utils';
import { Avatar } from '../Avatar';

import { useChatContext, useTranslationContext } from '../../context';

import type { DefaultOneChatGenerics } from '../../types';

const DefaultSearchEmpty = () => {
  const { t } = useTranslationContext('SearchResults');
  return (
    <div aria-live='polite' className='str-chat__channel-search-container-empty'>
      <SearchIcon />
      {t<string>('No results found')}
    </div>
  );
};

export type SearchResultsHeaderProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = Pick<SearchResultsProps<OneChatGenerics>, 'results'>;

const DefaultSearchResultsHeader = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>({
  results,
}: SearchResultsHeaderProps<OneChatGenerics>) => {
  const { t } = useTranslationContext('SearchResultsHeader');
  return (
    <div
      className='str-chat__channel-search-results-header'
      data-testid='channel-search-results-header'
    >
      {t<string>('searchResultsCount', {
        count: results.length,
      })}
    </div>
  );
};

export type SearchResultsListProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = Pick<
  SearchResultsProps<OneChatGenerics>,
  'results' | 'SearchResultItem' | 'selectResult'
> & {
  focusedUser?: number;
};

const DefaultSearchResultsList = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: SearchResultsListProps<OneChatGenerics>,
) => {
  const { focusedUser, results, SearchResultItem = DefaultSearchResultItem, selectResult } = props;

  return (
    <>
      {results.map((result, index) => (
        <SearchResultItem
          focusedUser={focusedUser}
          index={index}
          key={index}
          result={result}
          selectResult={selectResult}
        />
      ))}
    </>
  );
};

export type SearchResultItemProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = Pick<SearchResultsProps<OneChatGenerics>, 'selectResult'> & {
  index: number;
  result: ChannelOrUserResponse<OneChatGenerics>;
  focusedUser?: number;
};

const DefaultSearchResultItem = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: SearchResultItemProps<OneChatGenerics>,
) => {
  const { focusedUser, index, result, selectResult } = props;
  const focused = focusedUser === index;
  const { themeVersion } = useChatContext();

  const className = clsx(
    'str-chat__channel-search-result',
    focused && 'str-chat__channel-search-result--focused focused',
  );

  if (isChannel(result)) {
    const channel = result;

    return themeVersion === '2' ? (
      <ChannelPreview
        channel={channel}
        className={className}
        onSelect={() => selectResult(channel)}
      />
    ) : (
      <button
        aria-label={`Select Channel: ${channel.data?.name || ''}`}
        className={className}
        data-testid='channel-search-result-channel'
        onClick={() => selectResult(channel)}
        role='option'
      >
        <div className='result-hashtag'>#</div>
        <p className='channel-search__result-text'>{channel.data?.name}</p>
      </button>
    );
  } else {
    return (
      <button
        aria-label={`Select User Channel: ${result.name || ''}`}
        className={className}
        data-testid='channel-search-result-user'
        onClick={() => selectResult(result)}
        role='option'
      >
        <Avatar
          image={result.image}
          name={result.name || result.id}
          size={themeVersion === '2' ? 40 : undefined}
          user={result}
        />
        <div className='str-chat__channel-search-result--display-name'>
          {result.name || result.id}
        </div>
      </button>
    );
  }
};

const ResultsContainer = ({
  children,
  popupResults,
}: PropsWithChildren<{ popupResults?: boolean }>) => (
  <div
    aria-label='Channel search results'
    className={clsx(
      `str-chat__channel-search-container str-chat__channel-search-result-list`,
      popupResults ? 'popup' : 'inline',
    )}
  >
    {children}
  </div>
);

export type SearchResultsController<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  results: Array<ChannelOrUserResponse<OneChatGenerics>> | [];
  searching: boolean;
  selectResult: (result: ChannelOrUserResponse<OneChatGenerics>) => Promise<void> | void;
};

export type AdditionalSearchResultsProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  /** Display search results as an absolutely positioned popup, defaults to false and shows inline */
  popupResults?: boolean;
  /** Custom UI component to display empty search results */
  SearchEmpty?: React.ComponentType;
  /** Custom UI component to display the search loading state */
  SearchLoading?: React.ComponentType;
  /** Custom UI component to display a search result list item, defaults to and accepts the same props as: [DefaultSearchResultItem](https://github.com/botaas/aibot-uikit/blob/master/src/components/ChannelSearch/SearchResults.tsx) */
  SearchResultItem?: React.ComponentType<SearchResultItemProps<OneChatGenerics>>;
  /** Custom UI component to display the search results header */
  SearchResultsHeader?: React.ComponentType;
  /** Custom UI component to display all the search results, defaults to and accepts the same props as: [DefaultSearchResultsList](https://github.com/botaas/aibot-uikit/blob/master/src/components/ChannelSearch/SearchResults.tsx)  */
  SearchResultsList?: React.ComponentType<SearchResultsListProps<OneChatGenerics>>;
};

export type SearchResultsProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = AdditionalSearchResultsProps<OneChatGenerics> & SearchResultsController<OneChatGenerics>;

export const SearchResults = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  props: SearchResultsProps<OneChatGenerics>,
) => {
  const {
    popupResults,
    results,
    searching,
    SearchEmpty = DefaultSearchEmpty,
    SearchResultsHeader = DefaultSearchResultsHeader,
    SearchLoading,
    SearchResultItem = DefaultSearchResultItem,
    SearchResultsList = DefaultSearchResultsList,
    selectResult,
  } = props;

  const { t } = useTranslationContext('SearchResults');
  const [focusedResult, setFocusedResult] = useState<number>();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        setFocusedResult((prevFocused) => {
          if (prevFocused === undefined) return 0;
          return prevFocused === 0 ? results.length - 1 : prevFocused - 1;
        });
      }

      if (event.key === 'ArrowDown') {
        setFocusedResult((prevFocused) => {
          if (prevFocused === undefined) return 0;
          return prevFocused === results.length - 1 ? 0 : prevFocused + 1;
        });
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (focusedResult !== undefined) {
          selectResult(results[focusedResult]);
          return setFocusedResult(undefined);
        }
      }
    },
    [focusedResult],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, false);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (searching) {
    return (
      <ResultsContainer popupResults={popupResults}>
        {SearchLoading ? (
          <SearchLoading />
        ) : (
          <div
            className='str-chat__channel-search-container-searching'
            data-testid='search-in-progress-indicator'
          >
            {t<string>('Searching...')}
          </div>
        )}
      </ResultsContainer>
    );
  }

  if (!results.length) {
    return (
      <ResultsContainer popupResults={popupResults}>
        <SearchEmpty />
      </ResultsContainer>
    );
  }

  return (
    <ResultsContainer popupResults={popupResults}>
      <SearchResultsHeader results={results} />
      <SearchResultsList
        focusedUser={focusedResult}
        results={results}
        SearchResultItem={SearchResultItem}
        selectResult={selectResult}
      />
    </ResultsContainer>
  );
};
