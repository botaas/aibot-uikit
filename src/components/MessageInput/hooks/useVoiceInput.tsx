import { useCallback, useEffect, useRef } from 'react';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import type { MessageInputReducerAction, MessageInputState } from './useMessageInputState';
import type { FileLike } from 'react-file-utils';
import type { DefaultOneChatGenerics, Message } from '../../../types';
import { useTranslationContext } from '../../../context/TranslationContext';
import { getDateString } from '../../../i18n/utils';

export const useVoiceInput = <
	OneChatGenerics extends DefaultOneChatGenerics = DefaultOneChatGenerics
>(
	state: MessageInputState<OneChatGenerics>,
	dispatch: React.Dispatch<MessageInputReducerAction<OneChatGenerics>>,
	uploadNewFiles: (files: FileList | FileLike[] | File[]) => void,
	handleSubmit: (
		event?: React.BaseSyntheticEvent,
		customMessageData?: Partial<Message<OneChatGenerics>>
	) => Promise<void>,
) => {

	const { tDateTimeParser } = useTranslationContext('useVoiceInput');

	const { fileUploads, voiceInputIsEnabled } = state;

	const {
		startRecording,
		stopRecording,
		recordingBlob,
		isRecording,
	} = useAudioRecorder(
		{
			noiseSuppression: true,
			echoCancellation: true,
		},
	);

	// 录音过程中，关闭语音输入，也会生成一段录音，但是应该废弃
	const deprecatedRecordingBlob = useRef<Blob | null>(null)

	// 打开语音输入
	const enableVoiceInput = useCallback(
		(event: MouseEvent) => {
			event.preventDefault();
			// 切换输入方式先重置
			dispatch({
				type: 'clear'
			})
			dispatch({
				type: 'setVoiceInputIsEnabled',
				value: true,
			});
		},
		[],
	);

	// 关闭语音输入
	const disableVoiceInput = useCallback(
		(event: MouseEvent) => {
			event.preventDefault();
			// 切换输入方式先重置
			dispatch({
				type: 'clear'
			})
			dispatch({
				type: 'setVoiceInputIsEnabled',
				value: false,
			});
			// 停止正在进行的录制，也会生成一段录音，但是需要废弃
			if (isRecording) {
				stopRecording();
			}
		},
		[isRecording, stopRecording],
	);

	// 开始录音
	const startRecordingVoice = useCallback(
		(event: MouseEvent) => {
			event.preventDefault();
			startRecording();
		},
		[startRecording],
	);

	// 结束录音
	const stopRecordingVoice = useCallback(
		(event: MouseEvent) => {
			event.preventDefault();
			stopRecording();
		},
		[stopRecording],
	);

	// 得到录音
	useEffect(() => {
		if (!recordingBlob) return
		if (!voiceInputIsEnabled) {
			// 得到录音，但是语音输入已经关闭了，这段录音直接废弃
			deprecatedRecordingBlob.current = recordingBlob
			return
		}
		if (recordingBlob === deprecatedRecordingBlob.current) {
			// 是之前废弃的录音，直接忽略
			return
		}
		// 得到新的有效录音
		// 文件格式 audio/webm?codec=xxxx
		const type = recordingBlob.type.split(';')[0];
		// 文件后缀
		let ext = type.split('/')[1] ?? '';
		ext = ext ? `.${ext}` : '';
		// 上传音频
		const recordAt = getDateString({ format: 'h_mm_a', messageCreatedAt: new Date(), tDateTimeParser })
		const file = new File([recordingBlob], `recorded_at_${recordAt}${ext}`, { type })
		uploadNewFiles([file])
	}, [recordingBlob, voiceInputIsEnabled])

	// 音频文件上传完成，直接发送消息 
	useEffect(() => {
		if (!voiceInputIsEnabled) return
		// 没有语音文件
		const uploads = Object.values(fileUploads)
		if (uploads.length == 0) return
		// 语音还在上传
		const allUploaded = uploads.every(upload => upload.state !== 'uploading')
		if (!allUploaded) return
		// 发送消息
		handleSubmit()
	}, [voiceInputIsEnabled, fileUploads, handleSubmit])

	return {
		enableVoiceInput,
		disableVoiceInput,
		startRecordingVoice,
		stopRecordingVoice,
		isRecordingVoice: isRecording,
	};
};