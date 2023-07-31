import React from 'react';
import {
  KeyboardInputIcon as DefaultKeyboardInputIcon,
  VoiceInputIcon,
  LoadingIndicatorIcon,
} from './icons';

import { useMessageInputContext } from '../../context/MessageInputContext';
import { useComponentContext } from '../../context/ComponentContext';
import { useTranslationContext } from '../../context/TranslationContext';
import type { DefaultOneChatGenerics } from '../../types';

export const VoiceInput = <
  OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>() => {
  const { t } = useTranslationContext('VoiceInput');

  const {
    numberOfUploads,
    disableVoiceInput,
    startRecordingVoice,
    stopRecordingVoice,
    isRecordingVoice,
  } = useMessageInputContext<OneChatGenerics>('VoiceInput');

  const { KeyboardInputIcon = DefaultKeyboardInputIcon } = useComponentContext<OneChatGenerics>(
    'VoiceInput',
  );

  return (
    <>
      <div className={'str-chat__message-input'}>
        <div className='str-chat__message-input-inner'>
          {/* TODO rename class names */}
          <div
            className='str-chat__file-input-container'
            data-testid='keyboard-input-button'
            onClick={disableVoiceInput}
          >
            <label className='str-chat__file-input-label'>
              <KeyboardInputIcon />
            </label>
          </div>

          <div className='str-chat__message-voice-recorder-container'>
            {
              // 语音上传中
              !!numberOfUploads && (
                <div className='str-chat__message-voice-recorder-action'>
                  <div className='str-chat__voice-recorder-icon'>
                    <LoadingIndicatorIcon size={17} />
                  </div>
                  <p>{t<string>('Sending audio')}</p>
                </div>
              )
            }
            {
              // 录音中
              !numberOfUploads && isRecordingVoice && (
                <div
                  className='str-chat__message-voice-recorder-action'
                  onClick={stopRecordingVoice}
                >
                  <div className='str-chat__voice-recorder-icon str-chat__voice-recorder-stop'></div>
                  <p>{t<string>('Send')}</p>
                </div>
              )
            }
            {
              // 等待录音
              !numberOfUploads && !isRecordingVoice && (
                <div
                  className='str-chat__message-voice-recorder-action'
                  onClick={startRecordingVoice}
                >
                  <div className='str-chat__voice-recorder-icon str-chat__voice-recorder-microphone'>
                    <VoiceInputIcon />
                  </div>
                  <p>{t<string>('Click to talk')}</p>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </>
  );
};
