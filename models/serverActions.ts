export type OCRCoordinate = {
  x: number;
  y: number;
};

export type OCRWord = {
  text: string;
  boundingPolygon: OCRCoordinate[];
  confidence: number;
};

export type OCRLine = {
  text: string;
  boundingPolygon: OCRCoordinate[];
  words: OCRWord[];
};

export type OCRBlock = {
  lines: OCRLine[];
};

export type OCRResponse = {
  readResult: {
    blocks: OCRBlock[];
  };
};

export type Word = {
  text: string;
  pronunciation: string;
  meaning: string[];
};

export type DictionaryResponse = {
  explanation: string; 
  sentence: string;
  detectedLanguage: string;
  words: Word[];
};