import React from 'react';
import { TranslateLineResponse } from '../../models/Translation';

interface TranslationDisplayProps {
  sentence: TranslateLineResponse;
}

const TranslationDisplay: React.FC<TranslationDisplayProps> = ({ sentence }) => (
  <div className="rounded-md border px-2 py-1">
    <h3 className="text-2xl font-bold">Translation</h3>
    {sentence.translations.map((translation) => (
      <div className="mt-1" key={JSON.stringify(translation)}>
        {translation.text}
      </div>
    ))}
  </div>
);

export default TranslationDisplay;
