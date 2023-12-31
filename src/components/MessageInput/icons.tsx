import React, { useMemo } from 'react';
import { nanoid } from 'nanoid';

import { useTranslationContext } from '../../context/TranslationContext';
import { useChatContext } from '../../context/ChatContext';

import type { DefaultOneChatGenerics, Message } from '../../types';

export const EmojiIconLarge = () => {
  const { t } = useTranslationContext('EmojiIconLarge');

  return (
    <svg height='28' width='28' xmlns='http://www.w3.org/2000/svg'>
      <title>{t<string>('Open emoji picker')}</title>
      <g clipRule='evenodd' fillRule='evenodd'>
        <path d='M14 4.4C8.6 4.4 4.4 8.6 4.4 14c0 5.4 4.2 9.6 9.6 9.6c5.4 0 9.6-4.2 9.6-9.6c0-5.4-4.2-9.6-9.6-9.6zM2 14c0-6.6 5.4-12 12-12s12 5.4 12 12s-5.4 12-12 12s-12-5.4-12-12zM12.8 11c0 1-.8 1.8-1.8 1.8s-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8s1.8.8 1.8 1.8zM18.8 11c0 1-.8 1.8-1.8 1.8s-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8s1.8.8 1.8 1.8zM8.6 15.4c.6-.4 1.2-.2 1.6.2c.6.8 1.6 1.8 3 2c1.2.4 2.8.2 4.8-2c.4-.4 1.2-.6 1.6 0c.4.4.6 1.2 0 1.6c-2.2 2.6-4.8 3.4-7 3c-2-.4-3.6-1.8-4.4-3c-.4-.6-.2-1.2.4-1.8z' />
      </g>
    </svg>
  );
};

export const EmojiIconSmall = () => {
  const { t } = useTranslationContext('EmojiIconSmall');

  return (
    <svg height='14' width='14' xmlns='http://www.w3.org/2000/svg'>
      <title>{t<string>('Open emoji picker')}</title>
      <g clipRule='evenodd' fillRule='evenodd'>
        <path d='M6.7 1.42C3.73 1.42 1.42 3.73 1.42 6.7c0 2.97 2.31 5.28 5.28 5.28c2.97 0 5.28-2.31 5.28-5.28c0-2.97-2.31-5.28-5.28-5.28zM.1 6.7c0-3.63 2.97-6.6 6.6-6.6s6.6 2.97 6.6 6.6s-2.97 6.6-6.6 6.6s-6.6-2.97-6.6-6.6zM6.04 5.05c0 .55-.44.99-.99.99s-.99-.44-.99-.99s.44-.99.99-.99s.99.44.99.99zM9.34 5.05c0 .55-.44.99-.99.99s-.99-.44-.99-.99s.44-.99.99-.99s.99.44.99.99zM3.73 7.47c.33-.22.66-.11.88.11c.33.44.88.99 1.65 1.1c.66.22 1.54.11 2.64-1.1c.22-.22.66-.33.88 0c.22.22.33.66 0 .88c-1.21 1.43-2.64 1.87-3.85 1.65c-1.1-.22-1.98-.99-2.42-1.65c-.22-.33-.11-.66.22-.99z' />
      </g>
    </svg>
  );
};

// ThemingV2 icon
export const EmojiPickerIcon = () => (
  <svg
    preserveAspectRatio='xMinYMin'
    viewBox='0 0 28 28'
    width='100%'
    xmlns='http://www.w3.org/2000/svg'
  >
    <g clipRule='evenodd' fillRule='evenodd'>
      <path d='M14 4.4C8.6 4.4 4.4 8.6 4.4 14c0 5.4 4.2 9.6 9.6 9.6c5.4 0 9.6-4.2 9.6-9.6c0-5.4-4.2-9.6-9.6-9.6zM2 14c0-6.6 5.4-12 12-12s12 5.4 12 12s-5.4 12-12 12s-12-5.4-12-12zM12.8 11c0 1-.8 1.8-1.8 1.8s-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8s1.8.8 1.8 1.8zM18.8 11c0 1-.8 1.8-1.8 1.8s-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8s1.8.8 1.8 1.8zM8.6 15.4c.6-.4 1.2-.2 1.6.2c.6.8 1.6 1.8 3 2c1.2.4 2.8.2 4.8-2c.4-.4 1.2-.6 1.6 0c.4.4.6 1.2 0 1.6c-2.2 2.6-4.8 3.4-7 3c-2-.4-3.6-1.8-4.4-3c-.4-.6-.2-1.2.4-1.8z'></path>
    </g>
  </svg>
);

export const FileUploadIcon = () => {
  const { t } = useTranslationContext('FileUploadIcon');

  return (
    <svg height='14' width='14' xmlns='http://www.w3.org/2000/svg'>
      <title>{t<string>('Attach files')}</title>
      <path
        d='M7 .5c3.59 0 6.5 2.91 6.5 6.5s-2.91 6.5-6.5 6.5S.5 10.59.5 7 3.41.5 7 .5zm0 12c3.031 0 5.5-2.469 5.5-5.5S10.031 1.5 7 1.5A5.506 5.506 0 0 0 1.5 7c0 3.034 2.469 5.5 5.5 5.5zM7.506 3v3.494H11v1.05H7.506V11h-1.05V7.544H3v-1.05h3.456V3h1.05z'
        fillRule='nonzero'
      />
    </svg>
  );
};

export const FileUploadIconFlat = () => {
  const { t } = useTranslationContext('FileUploadIconFlat');

  return (
    <svg height='14' width='14' xmlns='http://www.w3.org/2000/svg'>
      <title>{t<string>('Attach files')}</title>
      <path
        d='M1.667.333h10.666c.737 0 1.334.597 1.334 1.334v10.666c0 .737-.597 1.334-1.334 1.334H1.667a1.333 1.333 0 0 1-1.334-1.334V1.667C.333.93.93.333 1.667.333zm2 1.334a1.667 1.667 0 1 0 0 3.333 1.667 1.667 0 0 0 0-3.333zm-2 9.333v1.333h10.666v-4l-2-2-4 4-2-2L1.667 11z'
        fillRule='nonzero'
      />
    </svg>
  );
};

export const LoadingIndicatorIcon = ({ size = 20 }: { size?: number }) => {
  const id = useMemo(() => nanoid(), []);

  return (
    <div className='str-chat__loading-indicator'>
      <svg
        data-testid='loading-indicator'
        height={size}
        viewBox='0 0 30 30'
        width={size}
        xmlns='http://www.w3.org/2000/svg'
      >
        <defs>
          <linearGradient id={`${id}-linear-gradient`} x1='50%' x2='50%' y1='0%' y2='100%'>
            <stop offset='0%' stopColor='#FFF' stopOpacity='0' />
            <stop data-testid='stop-color' offset='100%' stopOpacity='1' />
          </linearGradient>
        </defs>
        <path
          d='M2.518 23.321l1.664-1.11A12.988 12.988 0 0 0 15 28c7.18 0 13-5.82 13-13S22.18 2 15 2V0c8.284 0 15 6.716 15 15 0 8.284-6.716 15-15 15-5.206 0-9.792-2.652-12.482-6.679z'
          fill={`url(#${id}-linear-gradient)`}
          fillRule='evenodd'
        />
      </svg>
    </div>
  );
};

// ThemingV2 icon
export const UploadIcon = () => (
  <svg
    data-testid='attach'
    fill='none'
    height='24'
    viewBox='0 0 24 24'
    width='24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <g clipPath='url(#clip0_10878_5)'>
      <path
        d='M12.9997 6.99993L10.9997 6.99993L10.9997 10.9999L6.99972 10.9999L6.99972 12.9999L10.9997 12.9999L10.9997 16.9999L12.9997 16.9999L12.9997 12.9999L16.9997 12.9999L16.9997 10.9999L12.9997 10.9999L12.9997 6.99993ZM11.9997 1.99992C6.47972 1.99992 1.99972 6.47993 1.99972 11.9999C1.99972 17.5199 6.47972 21.9999 11.9997 21.9999C17.5197 21.9999 21.9997 17.5199 21.9997 11.9999C21.9997 6.47993 17.5197 1.99992 11.9997 1.99992ZM11.9997 19.9999C7.58972 19.9999 3.99972 16.4099 3.99972 11.9999C3.99972 7.58993 7.58972 3.99993 11.9997 3.99993C16.4097 3.99993 19.9997 7.58993 19.9997 11.9999C19.9997 16.4099 16.4097 19.9999 11.9997 19.9999Z'
        fill='black'
      />
    </g>
    <defs>
      <clipPath id='clip0_10878_5'>
        <rect fill='white' height='24' width='24' />
      </clipPath>
    </defs>
  </svg>
);

export const VoiceInputIcon = () => (
  <svg
    data-testid='voice-input'
    fill='none'
    height='24'
    viewBox='0 0 1024 1024'
    width='24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='M504,614h-.63a160.08,160.08,0,0,1-103.63-39.07c-29-25-45.62-57.15-45.62-88.26V190.42c0-31.28,16.8-63.56,46.08-88.56A160.82,160.82,0,0,1,504.46,63.1h.63a160.07,160.07,0,0,1,103.64,39.06c29,25,45.61,57.14,45.61,88.26V486.65c0,31.28-16.79,63.56-46.08,88.56A160.83,160.83,0,0,1,504,614Zm-.41-70H504a92,92,0,0,0,58.79-22c14.88-12.7,21.53-26.89,21.53-35.32V190.42c0-20-32.76-57.1-79.46-57.32h-.42c-21,0-42.41,8-58.8,22-14.86,12.69-21.52,26.88-21.52,35.32V486.65C424.14,506.66,456.91,543.76,503.61,544Z'></path>
    <path d='M619.34,225.42a35,35,0,0,1-35-35V175.09a35,35,0,0,1,70,0v15.33A35,35,0,0,1,619.34,225.42Z'></path>
    <path d='M389.14,225.42a35,35,0,0,1-35-35V175.09a35,35,0,0,1,70,0v15.33A35,35,0,0,1,389.14,225.42Z'></path>
    <path d='M504.24,716.11c-99.89,0-176.79-31.08-228.56-92.37-94-111.32-66.7-280.21-65.49-287.34a35,35,0,1,1,69,11.7c-.22,1.37-22.95,144.49,50.16,230.71,17.38,20.51,39.28,36.51,65.08,47.57,30.55,13.09,67.49,19.73,109.8,19.73s79.22-6.63,109.75-19.73c25.8-11.06,47.7-27.06,65.08-47.56,73.16-86.29,50.43-229.57,50.19-231a35,35,0,1,1,69-11.63c1.21,7.14,28.56,176.19-65.54,287.57C681,685,604.09,716.11,504.24,716.11Z'></path>
    <path d='M504.24,927.86a35,35,0,0,1-35-35V681.11a35,35,0,1,1,70,0V892.86A35,35,0,0,1,504.24,927.86Z'></path>
    <path d='M629.31,959.77H379.16a35,35,0,0,1,0-70H629.31a35,35,0,0,1,0,70Z'></path>
  </svg>
);

export const KeyboardInputIcon = () => (
  <svg
    data-testid='keyboard-input'
    fill='none'
    height='20'
    version='1.1'
    viewBox='0 0 60 40'
    width='30'
    xmlns='http://www.w3.org/2000/svg'
  >
    <defs>
      <clipPath id='SvgKeyboard_109730628689334272'>
        <rect height='40' rx='0' width='60' x='0' y='0'></rect>
      </clipPath>
    </defs>
    <g clipPath='url(#SvgKeyboard_109730628689334272)'>
      <g>
        <path
          d='M55.251859375,0.0380859375L4.748009375,0.0380859375C2.130189375,0.0412365375,0.008823215,2.2962759375,0.005859375,5.0790459375L0.005859375,34.8836859375C0.008823215,37.6664859375,2.130189375,39.9214859375,4.748009375,39.9246859375L55.251859375,39.9246859375C57.869659375,39.9214859375,59.991059375,37.6664859375,59.993959375,34.8836859375L59.993959375,5.0790459375C59.991059375,2.2962759375,57.869659375,0.0412368775,55.251859375,0.0380859375ZM56.437359375,34.8836859375C56.437359375,35.5799859375,55.906859375,36.1439859375,55.251859375,36.1439859375L4.748009375,36.1439859375C4.092999375,36.1439859375,3.562469375,35.5799859375,3.562469375,34.8836859375L3.562469375,5.0790459375C3.562469375,4.3827659375,4.092999375,3.8188059375,4.748009375,3.8188059375L55.251859375,3.8188059375C55.906859375,3.8188059375,56.437359375,4.3827659375,56.437359375,5.0790459375L56.437359375,34.8836859375Z'
          fillOpacity='1'
        ></path>
      </g>
      <g></g>
      <g>
        <rect
          fillOpacity='1'
          height='5.040957450866699'
          rx='0'
          width='5.927681922912598'
          x='11.38671875'
          y='11.31640625'
        ></rect>
      </g>
      <g>
        <rect
          fillOpacity='1'
          height='5.040957450866699'
          rx='0'
          width='5.927681922912598'
          x='11.38671875'
          y='23.66796875'
        ></rect>
      </g>
      <g>
        <rect
          fillOpacity='1'
          height='5.040957450866699'
          rx='0'
          width='5.927681922912598'
          x='21.8203125'
          y='11.31640625'
        ></rect>
      </g>
      <g>
        <rect
          fillOpacity='1'
          height='5.040957450866699'
          rx='0'
          width='16.360403060913086'
          x='21.8203125'
          y='23.66796875'
        ></rect>
      </g>
      <g>
        <rect
          fillOpacity='1'
          height='5.040957450866699'
          rx='0'
          width='5.927681922912598'
          x='32.296875'
          y='11.31640625'
        ></rect>
      </g>
      <g>
        <rect
          fillOpacity='1'
          height='5.040957450866699'
          rx='0'
          width='5.927681922912598'
          x='42.73046875'
          y='11.31640625'
        ></rect>
      </g>
      <g>
        <rect
          fillOpacity='1'
          height='5.040957450866699'
          rx='0'
          width='5.927681922912598'
          x='42.73046875'
          y='23.66796875'
        ></rect>
      </g>
    </g>
  </svg>
);

export const CloseIcon = () => (
  <svg
    data-testid='close-no-outline'
    fill='none'
    height='24'
    viewBox='0 0 24 24'
    width='24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z'
      fill='black'
    ></path>
  </svg>
);

export const RetryIcon = () => (
  <svg
    data-testid='retry'
    fill='none'
    height='24'
    viewBox='0 0 24 24'
    width='24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M17.6449 6.35C16.1949 4.9 14.2049 4 11.9949 4C7.57488 4 4.00488 7.58 4.00488 12C4.00488 16.42 7.57488 20 11.9949 20C15.7249 20 18.8349 17.45 19.7249 14H17.6449C16.8249 16.33 14.6049 18 11.9949 18C8.68488 18 5.99488 15.31 5.99488 12C5.99488 8.69 8.68488 6 11.9949 6C13.6549 6 15.1349 6.69 16.2149 7.78L12.9949 11H19.9949V4L17.6449 6.35Z'
      fill='black'
    />
  </svg>
);

export const DownloadIcon = () => (
  <svg
    data-testid='download'
    fill='none'
    height='24'
    viewBox='0 0 24 24'
    width='24'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04ZM19 18H6C3.79 18 2 16.21 2 14C2 11.95 3.53 10.24 5.56 10.03L6.63 9.92L7.13 8.97C8.08 7.14 9.94 6 12 6C14.62 6 16.88 7.86 17.39 10.43L17.69 11.93L19.22 12.04C20.78 12.14 22 13.45 22 15C22 16.65 20.65 18 19 18ZM13.45 10H10.55V13H8L12 17L16 13H13.45V10Z'
      fill='black'
    ></path>
  </svg>
);

export const SendIconV1 = () => {
  const { t } = useTranslationContext('SendButton');
  return (
    <svg height='17' viewBox='0 0 18 17' width='18' xmlns='http://www.w3.org/2000/svg'>
      <title>{t<string>('Send')}</title>
      <path
        d='M0 17.015l17.333-8.508L0 0v6.617l12.417 1.89L0 10.397z'
        fill='#006cff'
        fillRule='evenodd'
      />
    </svg>
  );
};

export const SendIconV2 = () => {
  const { t } = useTranslationContext('SendButton');
  return (
    <svg
      data-testid='send'
      fill='none'
      height='24'
      viewBox='0 0 24 24'
      width='24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <title>{t<string>('Send')}</title>
      <path
        d='M4.00952 22L24 12L4.00952 2L4 9.77778L18.2857 12L4 14.2222L4.00952 22Z'
        fill='black'
      ></path>
    </svg>
  );
};

export type SendButtonProps<
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
> = {
  sendMessage: (
    event: React.BaseSyntheticEvent,
    customMessageData?: Partial<Message<OneChatGenerics>>,
  ) => void;
} & React.ComponentProps<'button'>;

export const SendButton = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>({
  sendMessage,
  ...rest
}: SendButtonProps<OneChatGenerics>) => {
  const { themeVersion } = useChatContext('SendButton');

  return (
    <button
      aria-label='Send'
      className='str-chat__send-button'
      data-testid='send-button'
      onClick={sendMessage}
      type='button'
      {...rest}
    >
      {themeVersion === '2' ? <SendIconV2 /> : <SendIconV1 />}
    </button>
  );
};
