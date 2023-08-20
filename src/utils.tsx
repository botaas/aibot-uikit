import React, { ComponentProps, ComponentType, useEffect, useRef, useState } from 'react';
import emojiRegex from 'emoji-regex';
import { find } from 'linkifyjs';
import { nanoid } from 'nanoid';
import { findAndReplace, ReplaceFunction } from 'hast-util-find-and-replace';
import ReactMarkdown, { Options, uriTransformer } from 'react-markdown';

import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import mermaid from 'mermaid';

import { u } from 'unist-builder';
import { visit } from 'unist-util-visit';

import uniqBy from 'lodash.uniqby';
import clsx from 'clsx';

import type { Element } from 'react-markdown/lib/ast-to-react';
import type { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import type { Content, Root } from 'hast';
import type { DefaultOneChatGenerics, UserResponse } from './types';
import { delayRender } from './hooks/useDelayRender';

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (error) {
      console.error('copy to clipboard: ', error);
      throw error;
    }
    document.body.removeChild(textArea);
  }
}

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
  'span',
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
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
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

const detectHttp = /http(s?):\/\/(www\.)?/;

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

const Mermaid = (props: { code: string; onError: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.code && ref.current) {
      mermaid
        .run({
          nodes: [ref.current],
        })
        .catch((e) => {
          props.onError();
          console.error('[Mermaid] ', e.message);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.code]);

  function viewSvgInNewWindow() {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    const text = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([text], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url);
    if (win) {
      win.onload = () => URL.revokeObjectURL(url);
    }
  }

  return (
    <div
      className='no-dark'
      style={{ cursor: 'pointer', overflow: 'auto' }}
      ref={ref}
      onClick={() => viewSvgInNewWindow()}
    >
      {props.code}
    </div>
  );
};

const PreCode = (props: { children: any }) => {
  const ref = useRef<HTMLPreElement>(null);
  const [mermaidCode, setMermaidCode] = useState('');

  useEffect(() => {
    if (!ref.current) return;
    const mermaidDom = ref.current.querySelector('code.language-mermaid');
    if (mermaidDom) {
      setMermaidCode((mermaidDom as HTMLElement).innerText);
    }
  }, [props.children]);

  if (mermaidCode) {
    return <Mermaid code={mermaidCode} onError={() => setMermaidCode('')} />;
  }

  return (
    <pre ref={ref}>
      <span
        className='copy-code-button'
        onClick={() => {
          if (ref.current) {
            const code = ref.current.innerText;
            copyToClipboard(code);
          }
        }}
      ></span>
      {props.children}
    </pre>
  );
};

const KEY = '2ff2c1b746d605de30463e';

const IframelyRender = ({ href, children }: ComponentProps<'a'> & ReactMarkdownProps) => {
  const isUrl = href?.startsWith('http');
  const [_error, setError] = useState<unknown>();
  const [html, setHtml] = useState('');
  const [mediaType, setMediaType] = useState('');

  useEffect(() => {
    if (href && isUrl) {
      fetch(
        `https://cdn.iframe.ly/api/iframely?url=${encodeURIComponent(
          href,
        )}&api_key=${KEY}&iframe=1&omit_script=1`,
      )
        .then((res) => res.json())
        .then((res) => {
          if (res.error) {
            console.warn('fetch iframely error: ', res.error);
            setError(res.error);
          } else {
            setHtml(res.html);
            setMediaType(res.meta?.medium);
          }
        })
        .catch((error) => {
          console.warn('fetch iframely error: ', error);
          setError(error);
        });
    }
  }, []);

  if (html && (mediaType === 'video' || mediaType === 'image')) {
    return (
      <>
        {/* TODO iframely 内嵌的宽度是自适应的，所以需要一个占位的 <a /> 将气泡宽度撑开，靠度隐藏 */}
        <a
          className={clsx(
            { 'str-chat__message-url-link': isUrl },
            'str-chat__message-iframely-url-link',
          )}
          href={href}
          rel='nofollow noreferrer noopener'
          target='_blank'
        >
          {children}
        </a>
        <div
          className={`str-chat__message-iframely str-chat__message-iframely-${mediaType}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </>
    );
  }

  // 其他展示原始链接
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
};

// streaming 模式下一直追加文本，因此需要延时渲染等待 href 完整
const Anchor = delayRender<ComponentProps<'a'> & ReactMarkdownProps>('href', IframelyRender);

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
  pre: PreCode,
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

  // TODO 补全结尾不完整的 markdown 链接，否则 streaming 模式下追加文本时，遇到不完整的链接，会解析错误
  if (/\[([^[]+)\]\(http(s?):\/\/([^)]+)$/.test(newText)) {
    newText = newText + ')';
  }

  // TODO 代码块未闭合进行补全，否则检查链接是否在代码块中时错误
  const codeBlockQuotes = (newText.match(/```/g) || []).length;
  console.log('codeBlockQuotes: ' + codeBlockQuotes);
  if (codeBlockQuotes % 2 !== 0) {
    newText = newText + '```';
  }

  const markdownLinks = matchMarkdownLinks(newText);
  const codeBlocks = messageCodeBlocks(newText);
  // extract all valid links/emails within text and replace it with proper markup
  uniqBy([...find(newText, 'email'), ...find(newText, 'url')], 'value').forEach(
    ({ href, type, value, start, end }) => {
      const linkIsInBlock = codeBlocks.some((block) => block?.includes(value));

      // TODO 如果链接包含在 `` 行内代码块中，就不处理
      console.log(`value: ${value}, start: ${start}, end: ${end}`);
      if (
        start > 0 &&
        newText.charAt(start - 1) === '`' &&
        end < newText.length - 1 &&
        newText.charAt(end + 1) === '`'
      ) {
        return;
      }

      // check if message is already markdown
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
      className='str-chat__message-markdown'
      allowedElements={allowedMarkups}
      components={rehypeComponents}
      rehypePlugins={[
        rehypeKatex,
        [
          rehypeHighlight,
          {
            detect: false,
            ignoreMissing: true,
          },
        ],
        ...rehypePlugins,
      ]}
      remarkPlugins={[remarkMath, [remarkGfm, { singleTilde: false }]]}
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

export const isObject = (value: unknown): value is Record<any, any> =>
  value !== null && typeof value === 'object';
export const isFunction = (value: unknown): value is (...args: any) => any =>
  typeof value === 'function';

export const isString = (value: unknown): value is string => typeof value === 'string';
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isNumber = (value: unknown): value is number => typeof value === 'number';
export const isUndef = (value: unknown): value is undefined => typeof value === 'undefined';
