enum Language {
  japanese = 'ja'
}

interface Line {
  boundingBox: number[];
  text: string;
  words: Word[];
}

export interface Word {
  boundingBox: number[];
  text: string;
  confidence: number;
}

export interface ImageSearchResult {
  page: number;
  angle: number;
  width: number;
  height: number;
  unit: string;
  language: Language;
  lines: Line[]
}
