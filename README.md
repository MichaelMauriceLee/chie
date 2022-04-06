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

## Development

First, cd into /client-app and run the following commands to run the next.js project:

```bash
yarn install
yarn dev
```

Now navigate to localhost:3000 in your browser to use the site locally.
