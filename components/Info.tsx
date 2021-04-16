import React from 'react';

const Info: React.FC = () => (
  <div className="mt-2 space-y-4">
    <h3 className="text-2xl font-bold">
      Welcome
    </h3>
    <div>
      Chie is a next generation Japanese-English dictionary aimed towards
      English speakers learning Japanese.
    </div>
    <div>
      Chie supports first class intergration with Anki,
      a free software that allows you to learn new words in a language easier via flashcards.
    </div>
    <div>
      In addition to being able to look up words either in English
      or various forms of Japanese (romanji, kanji, kana) and add them to Anki,
      you can lookup words in images, as well as transcribe audio using AI.
    </div>

    <h3 className="text-2xl font-bold">
      Setup
    </h3>
    <div>
      To allow Chie access to Anki, first follow the instructions to install AnkiConnect&nbsp;
      <a className="text-blue-500 visited:text-purple-500 rounded focus:outline-none focus:ring focus:border-blue-500" href="https://foosoft.net/projects/anki-connect/">here.</a>
    </div>
    <div>
      After installing AnkiConnect, replace the AnkiConnect config with the following:
    </div>
    <div className="rounded p-4 bg-gray-200">
      <div>&#123;</div>
      <div>&emsp;&quot;apiKey&quot;: null</div>
      <div>&emsp;&quot;apiLogPath&quot;: null</div>
      <div>&emsp;&quot;webBindAddress&quot;: &quot;127.0.0.1&quot;</div>
      <div>&emsp;&quot;webBindPort&quot;: 8765</div>
      <div>&emsp;&quot;webCorsOrigin&quot;: &quot;http://localhost&quot;</div>
      <div>&emsp;&quot;webCorsOriginList&quot;: [</div>
      <div>&emsp;&emsp;&quot;http://localhost&quot;</div>
      <div>&emsp;&emsp;&quot;http://localhost:3000&quot;</div>
      <div>&emsp;&emsp;&quot;https://www.chie.app&quot;</div>
      <div>&emsp;]</div>
      <div>&#125;</div>
    </div>
    <div>
      You can now add cards to Anki using this site.
      Make sure to keep Anki running in the background.
    </div>

    <h3 className="text-2xl font-bold">
      Contributions
    </h3>
    <div>
      Chie is a free open source web app.&nbsp;
      If you would like to contribute some code,
      make suggestions or report any bugs, please click&nbsp;
      <a
        className="text-blue-500 visited:text-purple-500 rounded focus:outline-none focus:ring focus:border-blue-500"
        href="https://github.com/MichaelMauriceLee/chie"
      >
        here
      </a>
      .
    </div>
    <div>
      This site is using the Jisho.org API in order to provide english definitions.&nbsp;
      If you would like to support them, please click&nbsp;
      <a
        className="text-blue-500 visited:text-purple-500 rounded focus:outline-none focus:ring focus:border-blue-500"
        href="https://jisho.org/faq"
      >
        here
      </a>
      .
    </div>
  </div>
);

export default Info;
