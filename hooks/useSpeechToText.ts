import {
  SpeechConfig, AudioConfig, SpeechRecognizer,
} from 'microsoft-cognitiveservices-speech-sdk';
import { useRef, useState } from 'react';
import { getSpeechToken } from '../services/agent';

interface UseSpeechToText {
  displayText: string;
  tempDisplayText: string;
  fetchTextFromMic: () => Promise<void>;
  fetchTextFromFile: (audioFile: File) => Promise<void>;
  stopMicRecording: () => void;
  stopFileTranscription: () => void;
  isRecognizingMic: boolean;
  isRecognizingFile: boolean;
}

const useSpeechToText = (): UseSpeechToText => {
  const [displayText, setDisplayText] = useState('Upload an audio file or speak into your microphone');
  const [tempDisplayText, setTempDisplayText] = useState('');
  const [isRecognizingMic, setIsRecognizingMic] = useState(false);
  const [isRecognizingFile, setIsRecognizingFile] = useState(false);
  const micRecognizerInstance = useRef<SpeechRecognizer | null>(null);
  const fileRecognizerInstance = useRef<SpeechRecognizer | null>(null);

  const stopMicRecording = () => {
    setIsRecognizingMic(false);
    micRecognizerInstance.current = null;
  };

  const stopFileTranscription = () => {
    setIsRecognizingFile(false);
    fileRecognizerInstance.current = null;
  };

  const fetchTextFromMic = async () => {
    const { token, region } = await getSpeechToken();
    const speechConfig = SpeechConfig.fromAuthorizationToken(token, region);
    speechConfig.speechRecognitionLanguage = 'ja-JP';
    speechConfig.enableDictation();
    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
    micRecognizerInstance.current = recognizer;
    if (micRecognizerInstance.current) {
      setDisplayText('Speak into your microphone...');
      micRecognizerInstance.current.recognizing = (_, event) => {
        setTempDisplayText(event.result.text);
      };
      micRecognizerInstance.current.recognized = (_, event) => {
        setDisplayText((prev) => prev + event.result.text);
        setTempDisplayText('');
      };
      micRecognizerInstance.current.startContinuousRecognitionAsync(
        () => { setIsRecognizingMic(true); },
        () => {
          setDisplayText('ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.');
          setIsRecognizingMic(false);
        },
      );
    }
  };

  const fetchTextFromFile = async (audioFile: File) => {
    if (audioFile.name.split('.').pop() !== 'wav') {
      setDisplayText('ERROR: File must be .wav sound file.');
      return;
    }
    const { token, region } = await getSpeechToken();
    const speechConfig = SpeechConfig.fromAuthorizationToken(token, region);
    speechConfig.speechRecognitionLanguage = 'ja-JP';
    speechConfig.enableDictation();
    const audioConfig = AudioConfig.fromWavFileInput(audioFile);
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
    fileRecognizerInstance.current = recognizer;
    if (fileRecognizerInstance.current) {
      setDisplayText(`${audioFile.name} size=${audioFile.size} bytes`);
      fileRecognizerInstance.current.recognizing = (_, event) => {
        setTempDisplayText(event.result.text);
      };
      fileRecognizerInstance.current.recognized = (_, event) => {
        setDisplayText((prev) => prev + event.result.text);
        setTempDisplayText('');
      };
      fileRecognizerInstance.current.sessionStopped = () => {
        setIsRecognizingFile(false);
      };
      fileRecognizerInstance.current.startContinuousRecognitionAsync(
        () => { setIsRecognizingFile(true); },
        () => {
          setDisplayText('ERROR: Speech was cancelled or could not be recognized.');
          setIsRecognizingFile(false);
        },
      );
    }
  };

  return {
    displayText,
    tempDisplayText,
    fetchTextFromMic,
    fetchTextFromFile,
    stopMicRecording,
    stopFileTranscription,
    isRecognizingMic,
    isRecognizingFile,
  };
};

export default useSpeechToText;
