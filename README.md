## Setup

Follow the instructions to install AnkiConnect here:
https://foosoft.net/projects/anki-connect/

After installing, replace the AnkiConnect config with the following:
```bash
{
    "apiKey": null,
    "apiLogPath": null,
    "webBindAddress": "127.0.0.1",
    "webBindPort": 8765,
    "webCorsOrigin": "http://localhost",
    "webCorsOriginList": [
        "http://localhost",
        "http://localhost:3000",
        "https://www.chie.app"
    ]
}
```

You can now use https://www.chie.app/ or run the next.js app locally.

Make sure to keep Anki running in the background as you use the site.

## How to run this repo locally

Create a file called '.env.local' in the root directory and copy the following contents into that file and save (make sure to replace the values in {} with their actual value):

```bash
CV_NAME={cv_name}
CV_KEY={cv_key}
SPEECH_REGION={speech_region}
SPEECH_KEY={speech_key}
TRANSLATION_REGION={translation_region}
TRANSLATION_KEY={translation_key}
```

Next, type the following command into the console:

```bash
npm run dev
```

Now navigate to localhost:3000 in your browser to use the site locally.
