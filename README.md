## Amazon Mining Watch

This is the frontend to Amazon Mining Watch built on [Next.js](https://nextjs.org/) and [react-map-gl](https://visgl.github.io/react-map-gl/). It uses Next's native i18n support and App Router. As Next's language handling is still in flux at time of writing, it uses some custom middlewear and a cookie to persist the user's locale.


## Content management

Content is pulled from markdown files in `./markdown`.

## Translations

Interface translations are stored in `./dictionaries`.

## Deploy 

To create a production build:

- Ensure you have created an `.env.local` file and populated it with the required env vars.
- Run `yarn build` to create a production build.

## Developers

Rename env-example.txt to .env and add your env values.

Make sure you're using node version 22. If you use `nvm`, run:

```bash
nvm use
```

First, install dependences:

```bash
yarn install
```

and then start the dev server:

```bash
yarn dev
```

## Adding new mining data

After uploading the mining data to S3 from the [mining-detector](https://github.com/earthrise-media/mining-detector/) repo, you will need to add a new layer to `MINING_LAYERS`, in `src/constants/map.ts`. Remember to set the values:

- `yearQuarter`: in YYYYQQ format, e.g. 202504 is 2025-Q4, 202200 means the entire year of 2022, no quarter
- `satelliteEndpoint`: the endpoint for the satellite imagery
- `satelliteDates`: the dates part of the satellite imagery url, in the format: `YYYY-MM-DD/YYYY-MM-DD` (start date/end date)
- `dataUrl`: the url to the geojson containing the mining detection data
