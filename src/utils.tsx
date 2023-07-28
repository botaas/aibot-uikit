import React, { ComponentProps, ComponentType, memo, useEffect, useState } from 'react';
import emojiRegex from 'emoji-regex';
import { find } from 'linkifyjs';
import { nanoid } from 'nanoid';
import { findAndReplace, ReplaceFunction } from 'hast-util-find-and-replace';
import ReactMarkdown, { Options, uriTransformer } from 'react-markdown';
import { u } from 'unist-builder';
import { visit } from 'unist-util-visit';

import remarkGfm from 'remark-gfm';
import uniqBy from 'lodash.uniqby';
import clsx from 'clsx';

import type { Element } from 'react-markdown/lib/ast-to-react';
import type { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import type { Content, Root } from 'hast';
import type { DefaultOneChatGenerics, UserResponse } from './types';
import debounce from 'lodash.debounce';

export const isOnlyEmojis = (text?: string) => {
  if (!text) return false;

  const noEmojis = text.replace(emojiRegex(), '');
  const noSpace = noEmojis.replace(/[\s\n]/gm, '');

  return !noSpace;
};

const allowedMarkups: Array<keyof JSX.IntrinsicElements | 'emoji' | 'mention'> = [
  'html',
  'text',
  'br',
  'p',
  'em',
  'strong',
  'a',
  'img',
  'video',
  'iframe',
  'ol',
  'ul',
  'li',
  'code',
  'pre',
  'blockquote',
  'del',
  // custom types (tagNames)
  'emoji',
  'mention',
];

type HNode = Content | Root;

export const matchMarkdownLinks = (message: string) => {
  const regexMdLinks = /\[([^[]+)\](\(.*\))/gm;
  const matches = message.match(regexMdLinks);
  const singleMatch = /\[([^[]+)\]\((.*)\)/;

  const links = matches
    ? matches.map((match) => {
        const i = singleMatch.exec(match);
        return i && [i[1], i[2]];
      })
    : [];

  return links.flat();
};

export const messageCodeBlocks = (message: string) => {
  const codeRegex = /```[a-z]*\n[\s\S]*?\n```|`[a-z]*[\s\S]*?`/gm;
  const matches = message.match(codeRegex);
  return matches || [];
};

const detectHttp = /(http(s?):\/\/)?(www\.)?/;

function formatUrlForDisplay(url: string) {
  try {
    return decodeURIComponent(url).replace(detectHttp, '');
  } catch (e) {
    return url;
  }
}

function encodeDecode(url: string) {
  try {
    return encodeURI(decodeURIComponent(url));
  } catch (error) {
    return url;
  }
}

const KEY = '2ff2c1b746d605de30463e';

type IFramelyError = { code: string | number; message: string };

const UnMemorizedAnchor = ({ children, href }: ComponentProps<'a'> & ReactMarkdownProps) => {
  const isEmail = href?.startsWith('mailto:');
  const isUrl = href?.startsWith('http');

  const [error, setError] = useState<IFramelyError | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [html, setHtml] = useState<{ __html: string }>({
    __html: '<div />',
  });

  const doFetch = (href: string) => {
    fetch(
      `https://cdn.iframe.ly/api/iframely?url=${encodeURIComponent(
        href,
      )}&api_key=${KEY}&iframe=1&omit_script=1`,
    )
      .then((res) => res.json())
      .then(
        (res) => {
          setIsLoaded(true);
          if (res.html) {
            setHtml({ __html: res.html });
          } else if (res.error) {
            setError({ code: res.error, message: res.message });
          }
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        },
      )
      .catch((e) => console.error('iframely fetch error: ', e));
  };

  const debouncedFetch = debounce(doFetch, 500);

  useEffect(
    () => () => {
      debouncedFetch.cancel();
    },
    [],
  );

  useEffect(() => {
    if (href && isUrl) {
      setError(null);

      debouncedFetch(href);
    } else {
      setError({ code: 400, message: 'Provide url attribute for the element' });
    }
  }, [href, isUrl]);

  useEffect(() => {
    (window as any).iframely && (window as any).iframely.load();
  });

  if (!href || (!isEmail && !isUrl)) return <>{children}</>;

  if (error) {
    return (
      <a
        className={clsx({ 'str-chat__message-url-link': isUrl })}
        href={href}
        rel='nofollow noreferrer noopener'
        target='_blank'
      >
        {children}
      </a>
    );
  } else if (!error && !isLoaded) {
    return <div />;
  } else {
    return <div className={'str-chat__message-iframely'} dangerouslySetInnerHTML={html} />;
  }
};

const Anchor = memo(UnMemorizedAnchor);

const Emoji = ({ children }: ReactMarkdownProps) => (
  <span className='inline-text-emoji' data-testid='inline-text-emoji'>
    {children}
  </span>
);

export type MentionProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = ReactMarkdownProps & {
  /**
   * @deprecated will be removed in the next major release, transition to using `node.mentionedUser` instead
   */
  mentioned_user: UserResponse<OneChatGenerics>;
  node: {
    /**
     * @deprecated will be removed in the next major release, transition to using `node.mentionedUser` instead
     */
    mentioned_user: UserResponse<OneChatGenerics>;
    mentionedUser: UserResponse<OneChatGenerics>;
  };
};

const Mention = <OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics>({
  children,
  node: { mentionedUser },
}: MentionProps<OneChatGenerics>) => (
  <span className='str-chat__message-mention' data-user-id={mentionedUser.id}>
    {children}
  </span>
);

export const markDownRenderers: RenderTextOptions['customMarkDownRenderers'] = {
  a: Anchor,
  emoji: Emoji,
  mention: Mention,
};

export const emojiMarkdownPlugin = () => {
  const replace: ReplaceFunction = (match) =>
    u('element', { tagName: 'emoji' }, [u('text', match)]);

  const transform = (node: HNode) => findAndReplace(node, emojiRegex(), replace);

  return transform;
};

export const mentionsMarkdownPlugin = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
  mentioned_users: UserResponse<OneChatGenerics>[],
) => () => {
  const mentioned_usernames = mentioned_users
    .map((user) => user.name || user.id)
    .filter(Boolean)
    .map(escapeRegExp);

  const mentionedUsersRegex = new RegExp(
    mentioned_usernames.map((username) => `@${username}`).join('|'),
    'g',
  );

  const replace: ReplaceFunction = (match) => {
    const usernameOrId = match.replace('@', '');
    const user = mentioned_users.find(
      ({ id, name }) => name === usernameOrId || id === usernameOrId,
    );
    return u('element', { mentionedUser: user, tagName: 'mention' }, [u('text', match)]);
  };

  const transform = (tree: HNode): HNode => {
    if (!mentioned_usernames.length) return tree;

    // handles special cases of mentions where user.name is an e-mail
    // Remark GFM translates all e-mail-like text nodes to links creating
    // two separate child nodes "@" and "your.name@as.email" instead of
    // keeping it as one text node with value "@your.name@as.email"
    // this piece finds these two separated nodes and merges them together
    // before "replace" function takes over
    visit(tree, (node, index, parent) => {
      if (index === null) return;
      if (!parent) return;

      const nextChild = parent.children.at(index + 1) as Element;
      const nextChildHref = nextChild?.properties?.href as string | undefined;

      if (
        node.type === 'text' &&
        // text value has to have @ sign at the end of the string
        // and no other characters except whitespace can precede it
        // valid cases:   "text @", "@", " @"
        // invalid cases: "text@", "@text",
        /.?\s?@$|^@$/.test(node.value) &&
        nextChildHref?.startsWith('mailto:')
      ) {
        const newTextValue = node.value.replace(/@$/, '');
        const username = nextChildHref.replace('mailto:', '');
        parent.children[index] = u('text', newTextValue);
        parent.children[index + 1] = u('text', `@${username}`);
      }
    });

    return findAndReplace(tree, mentionedUsersRegex, replace);
  };

  return transform;
};

export type RenderTextOptions<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  customMarkDownRenderers?: Options['components'] &
    Partial<{
      emoji: ComponentType<ReactMarkdownProps>;
      mention: ComponentType<MentionProps<OneChatGenerics>>;
    }>;
};

export const renderText = <OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics>(
  text?: string,
  mentionedUsers?: UserResponse<OneChatGenerics>[],
  { customMarkDownRenderers }: RenderTextOptions = {},
) => {
  // take the @ mentions and turn them into markdown?
  // translate links
  if (!text) return null;
  if (text.trim().length === 1) return <>{text}</>;

  let newText = text;
  const markdownLinks = matchMarkdownLinks(newText);
  const codeBlocks = messageCodeBlocks(newText);

  // extract all valid links/emails within text and replace it with proper markup
  uniqBy([...find(newText, 'email'), ...find(newText, 'url')], 'value').forEach(
    ({ href, type, value }) => {
      const linkIsInBlock = codeBlocks.some((block) => block?.includes(value));

      // check if message is already  markdown
      const noParsingNeeded =
        markdownLinks &&
        markdownLinks.filter((text) => {
          const strippedHref = href?.replace(detectHttp, '');
          const strippedText = text?.replace(detectHttp, '');

          if (!strippedHref || !strippedText) return false;

          return strippedHref.includes(strippedText) || strippedText.includes(strippedHref);
        });

      if (noParsingNeeded.length > 0 || linkIsInBlock) return;

      try {
        // special case for mentions:
        // it could happen that a user's name matches with an e-mail format pattern.
        // in that case, we check whether the found e-mail is actually a mention
        // by naively checking for an existence of @ sign in front of it.
        if (type === 'email' && mentionedUsers) {
          const emailMatchesWithName = mentionedUsers.some((u) => u.name === value);
          if (emailMatchesWithName) {
            newText = newText.replace(new RegExp(escapeRegExp(value), 'g'), (match, position) => {
              const isMention = newText.charAt(position - 1) === '@';
              // in case of mention, we leave the match in its original form,
              // and we let `mentionsMarkdownPlugin` to do its job
              return isMention ? match : `[${match}](${encodeDecode(href)})`;
            });

            return;
          }
        }

        const displayLink = type === 'email' ? value : formatUrlForDisplay(href);

        newText = newText.replace(
          new RegExp(escapeRegExp(value), 'g'),
          `[${displayLink}](${encodeDecode(href)})`,
        );
      } catch (e) {
        void e;
      }
    },
  );

  const rehypePlugins = [emojiMarkdownPlugin];

  if (mentionedUsers?.length) {
    rehypePlugins.push(mentionsMarkdownPlugin(mentionedUsers));
  }

  // TODO: remove in the next major release
  if (customMarkDownRenderers?.mention) {
    const MentionComponent = customMarkDownRenderers['mention'];

    // eslint-disable-next-line react/display-name
    customMarkDownRenderers['mention'] = ({ node, ...rest }) => (
      <MentionComponent
        // @ts-ignore
        mentioned_user={node.mentionedUser}
        // @ts-ignore
        node={{ mentioned_user: node.mentionedUser, ...node }}
        {...rest}
      />
    );
  }

  const rehypeComponents = {
    ...markDownRenderers,
    ...customMarkDownRenderers,
  };

  return (
    <ReactMarkdown
      allowedElements={allowedMarkups}
      components={rehypeComponents}
      rehypePlugins={rehypePlugins}
      remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
      skipHtml
      transformLinkUri={(uri) => (uri.startsWith('app://') ? uri : uriTransformer(uri))}
      unwrapDisallowed
    >
      {newText}
    </ReactMarkdown>
  );
};

export function escapeRegExp(text: string) {
  return text.replace(/[-[\]{}()*+?.,/\\^$|#]/g, '\\$&');
}

/**
 * @deprecated will be removed in the next major release
 */
export const generateRandomId = nanoid;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt#getting_whole_characters
export const getWholeChar = (str: string, i: number) => {
  const code = str.charCodeAt(i);

  if (Number.isNaN(code)) return '';

  if (code < 0xd800 || code > 0xdfff) return str.charAt(i);

  if (0xd800 <= code && code <= 0xdbff) {
    if (str.length <= i + 1) {
      throw 'High surrogate without following low surrogate';
    }

    const next = str.charCodeAt(i + 1);

    if (0xdc00 > next || next > 0xdfff) {
      throw 'High surrogate without following low surrogate';
    }

    return str.charAt(i) + str.charAt(i + 1);
  }

  if (i === 0) {
    throw 'Low surrogate without preceding high surrogate';
  }

  const prev = str.charCodeAt(i - 1);

  if (0xd800 > prev || prev > 0xdbff) {
    throw 'Low surrogate without preceding high surrogate';
  }

  return '';
};
