import {
  SpeechConfig,
  SpeechSynthesizer,
  AudioConfig,
  ResultReason,
} from 'microsoft-cognitiveservices-speech-sdk';
import { getSpeechToken } from '../services/agent';

const useTextToSpeech = async (
  text: string,
  errorCallback?: (error: Error) => unknown,
) : Promise<void> => {
  const { token, region } = await getSpeechToken();
  const speechConfig = SpeechConfig.fromAuthorizationToken(token, region);
  const audioConfig = AudioConfig.fromDefaultSpeakerOutput();
  speechConfig.speechSynthesisLanguage = 'ja-JP';
  speechConfig.speechSynthesisVoiceName = 'ja-JP-KeitaNeural';
  const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
  synthesizer.speakTextAsync(text, (result) => {
    if (result.reason === ResultReason.Canceled) {
      const error = new Error('Text to speech failed');
      if (errorCallback) {
        errorCallback(error);
      } else {
        throw error;
      }
    }
    synthesizer.close();
    return result.audioData;
  },
  (error) => {
    synthesizer.close();
    const err = new Error(error);
    if (errorCallback) {
      errorCallback(err);
    } else {
      throw err;
    }
  });
};

export default useTextToSpeech;
