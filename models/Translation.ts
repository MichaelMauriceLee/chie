export interface TranslateLineRequest {
  Text: string;
}

export interface Translation {
  text: string;
  to: string;
}

export interface DetectedLanguage {
  language: string;
  score: number;
}

export interface TranslateLineResponse {
  detectedLanguage?: DetectedLanguage;
  translations: Translation[];
}
