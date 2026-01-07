import {
  AudioConfig,
  SpeechConfig,
  SpeechSynthesizer,
  PushAudioOutputStream,
  PushAudioOutputStreamCallback,
} from "microsoft-cognitiveservices-speech-sdk";

function getTtsVolume(): number {
  if (typeof localStorage === "undefined") return 100;
  return parseInt(localStorage.getItem("ttsVolume") ?? "100", 10);
}

export function speakText(
  text: string,
  detectedLanguage: string,
  token: string,
  region: string
) {
  const speechConfig = SpeechConfig.fromAuthorizationToken(token, region);
  speechConfig.speechSynthesisLanguage = detectedLanguage;

  // Use stream output to capture audio and control volume via Web Audio API
  const volume = getTtsVolume();
  const audioCallback = new VolumeControlledAudioCallback(volume);
  const stream = PushAudioOutputStream.create(audioCallback);
  const audioConfig = AudioConfig.fromStreamOutput(stream);
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

class VolumeControlledAudioCallback implements PushAudioOutputStreamCallback {
  private readonly audioChunks: Uint8Array[] = [];
  private readonly volume: number;

  constructor(volume: number) {
    this.volume = volume;
  }

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

      // Create audio blob and play with volume control
      const blob = new Blob([audioData], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = this.volume / 100;
      audio.onended = () => URL.revokeObjectURL(url);
      audio.play();
    } catch (e) {
      console.error("Error playing audio:", e);
    }
  }
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
