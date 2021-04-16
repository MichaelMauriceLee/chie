import React from 'react';
import { TranslateLineResponse } from '../../models/Translation';
import TranslationDisplay from './TranslationDisplay';

interface TranslationProps {
  sentence: TranslateLineResponse[];
  isLoading: boolean;
}

const Translation: React.FC<TranslationProps> = ({ sentence, isLoading }) => (
  <div className="mt-2">
    { isLoading
      ? (
        <div className="rounded-md border border-blue-400 px-2 py-1 h-96 animate-pulse" />
      )
      : sentence.map((translation) => (
        <TranslationDisplay
          sentence={translation}
          key={JSON.stringify(translation)}
        />
      ))}
  </div>
);

export default Translation;
