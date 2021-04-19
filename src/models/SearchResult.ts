/* eslint-disable camelcase */
export interface JapaneseWord {
  word: string;
  reading: string;
}

interface Sense {
  antonyms: [];
  english_definitions: string[];
  info: [];
  links: [];
  parts_of_speech: string[];
  restrictions: [];
  see_also: [];
  source: [];
  tags: string[];
}

export interface SearchResult {
  slug: string;
  is_common: boolean;
  tags: string[];
  jlpt?: string[];
  japanese: JapaneseWord[];
  senses: Sense[];
  attribution: unknown;
}
