import {
  AudioConfig,
  SpeechConfig,
  SpeechSynthesizer,
  PushAudioOutputStream,
  PushAudioOutputStreamCallback,
} from "microsoft-cognitiveservices-speech-sdk";

export function speakText(
  text: string,
  detectedLanguage: string,
  token: string,
  region: string
) {
  const speechConfig = SpeechConfig.fromAuthorizationToken(token, region);
  speechConfig.speechSynthesisLanguage = detectedLanguage;
  const audioConfig = AudioConfig.fromDefaultSpeakerOutput();
  const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

  synthesizer.speakTextAsync(
    text,
    () => synthesizer.close(),
    (error) => {
      synthesizer.close();
      console.error("Speech synthesis error:", error);
    }
  );
}

export async function saveAudioFile(
  text: string,
  detectedLanguage: string,
  token: string,
  region: string
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const speechConfig = SpeechConfig.fromAuthorizationToken(token, region);
    speechConfig.speechSynthesisLanguage = detectedLanguage;

    class CustomAudioCallback implements PushAudioOutputStreamCallback {
      private readonly audioChunks: Uint8Array[] = [];

      write(dataBuffer: ArrayBuffer) {
        this.audioChunks.push(new Uint8Array(dataBuffer));
      }

      close() {
        try {
          const audioData = new Uint8Array(
            this.audioChunks.reduce((acc, cur) => acc + cur.length, 0)
          );
          let offset = 0;
          for (const chunk of this.audioChunks) {
            audioData.set(chunk, offset);
            offset += chunk.length;
          }
          const base64String = btoa(String.fromCharCode(...audioData));
          resolve(`data:audio/mpeg;base64,${base64String}`);
        } catch (e) {
          console.error("Error finalizing audio:", e);
          reject(new Error("Failed to finalize audio data"));
        }
      }
    }

    const audioCallback = new CustomAudioCallback();
    const stream = PushAudioOutputStream.create(audioCallback);
    const audioConfig = AudioConfig.fromStreamOutput(stream);
    const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

    synthesizer.speakTextAsync(
      text,
      () => synthesizer.close(),
      (error) => {
        synthesizer.close();
        console.error("Audio generation error:", error);
        reject(new Error("Audio synthesis failed"));
      }
    );
  });
}
