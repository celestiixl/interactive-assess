# BioSpark Phenomena Uploads

Drop standalone phenomenon HTML files in this folder.

Rules:

- File name should be kebab-case, for example: `osmosis-lab.html`
- Keep assets relative to this folder (or inline) when possible.
- Avoid absolute URLs for local media so it works in dev and production.

How it maps in BioSpark:

- File path: `apps/web/public/phenomena/osmosis-lab.html`
- Direct URL: `/phenomena/osmosis-lab.html`
- Studio route: `/phenomena-studio/osmosis-lab`

The studio route wraps your HTML in an iframe with BioSpark navigation.
