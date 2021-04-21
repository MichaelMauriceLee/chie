/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Document, {
  Html, Head, Main, NextScript, DocumentContext,
} from 'next/document';

class MyDocument extends Document {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="manifest" href="manifest.json" />
          <meta name="description" content="Next generation Japanese dictionary with Anki Integration, text recognition, and speech recognition" />
          <script type="text/javascript">
            window._mNHandle = window._mNHandle ||
            {' '}
            {}
            ;
            window._mNHandle.queue = window._mNHandle.queue || [];
            medianet_versionId = &quot;3121199&quot;;
          </script>
          <script src="https://contextual.media.net/dmedianet.js?cid=8CU36X42E" async="async" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
