import Link from 'next/link';
import React, { FC } from 'react';
import wordList from '../utils/wordList';

const CommonWords: FC = () => (
  <div className="mt-2 space-y-2">
    <div>
      Below are 1000 common words used in Japanese.  Click on one of them to see its definition.
    </div>

    { wordList.map((word) => (
      <div>
        <Link href={`/results/${word}`}>
          <a
            className="text-xl hover:text-blue-500 rounded focus:outline-none focus:ring focus:border-blue-500"
            href={`/results/${word}`}
          >
            { word }
          </a>
        </Link>
      </div>
    ))}
  </div>

);

export default CommonWords;
