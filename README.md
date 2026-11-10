# AI ReadyPhenomen

An interactive 3D showcase of the AI-READI dataset. Explore sensors on a full-body mannequin, switch to organ context, and open compact views of wearable signals, ECG, laboratory results, and clinical assessments.

Built with React, TypeScript, Three.js, React Three Fiber, and Vite.

## Run locally

Requires Node.js 22.18 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Without a dataset connection, recorded measurements display as unavailable. Environmental example values and retinal images come from the public AI-READI documentation and are labeled accordingly.

## Connect licensed data

Participant records are not included. A separately obtained, authorized local copy of AI-READI v3 is required to display recordings.

Requires Python 3.11 or newer.

1. Create a Python environment and install the extractor dependencies:

   ```sh
   python3 -m venv .venv
   .venv/bin/python -m pip install -r requirements.txt
   ```

2. Set the dataset and output locations outside this repository:

   ```sh
   export AI_READI_SAMPLE_DIR=/absolute/path/to/ai-readi-y3
   export AI_READI_PREVIEW_JSON=/absolute/path/to/private-preview/preview.json
   .venv/bin/python scripts/build_local_preview.py
   ```

3. Copy `.env.example` to `.env.local`, set the same paths, and restart `npm run dev`.

Recordings are served only through a development endpoint on the loopback interface. Production builds do not contain the endpoint or participant values. See [data access](docs/data-access.md) for extraction rules and limitations.

## Checks

```sh
npm run check
npm run test:python
```

`check` runs formatting, TypeScript tests, the production build, and the organ geometry audit. Python tests use temporary fixtures and do not need participant data. For Python formatting, install `requirements-dev.txt` and run `ruff format scripts tests`.

## Project structure

- `src/components/details/` — measurement index and detail cards
- `src/components/scene/` — wearable and organ geometry
- `src/context/` — local recording state
- `src/data/` — modality definitions and anatomical placement
- `src/lib/` — chart formatting and geometry utilities
- `scripts/` — local data extraction and anatomy audit
- `tests/` — regression tests and numerical fixtures
- `public/assets/` — licensed mannequin, organ models, and documentation images

The anatomy is an educational visualization fitted to a generic mannequin, not a registered clinical atlas. Clinical measurements and independent examples must not be interpreted as one person's profile.

## References and media

- [AI-READI dataset documentation](https://docs.aireadi.org/docs/3/about)
- [Architecture](docs/architecture.md)
- [Asset attribution and data provenance](docs/assets.md)

Dataset access and media licenses are separate from the application source. See the attribution document before redistributing assets or data.
