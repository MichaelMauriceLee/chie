# Chie

Chie is a next generation Japanese-English dictionary aimed towards English speakers learning Japanese.

## Setup

Follow the instructions to install AnkiConnect here:
https://foosoft.net/projects/anki-connect/

After installing, replace the AnkiConnect config with the following:

```bash
{
    "apiKey": null,
    "apiLogPath": null,
    "ignoreOriginList": [],
    "webBindAddress": "127.0.0.1",
    "webBindPort": 8765,
    "webCorsOriginList": [
        "http://localhost",
        "http://localhost:3000",
        "https://chie.vercel.app"
    ]
}
```

You can now use https://www.chie.vercel.app/ or run the next.js app locally.

Make sure to keep Anki running in the background as you use the site.

## Development

```bash
npm install
npm run dev
```

Navigate to localhost:3000 in your browser to use the site locally.
