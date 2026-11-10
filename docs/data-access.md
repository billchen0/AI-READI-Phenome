# Local data access

The application separates public source code from licensed participant records. Keep the dataset and extracted preview outside the repository, its `public/` directory, and build output.

## Extraction

`scripts/build_local_preview.py` reads an authorized AI-READI v3 directory. It exports independently selected examples for ECG, CGM, activity, heart rate, oxygen saturation, respiration, sleep, stress, clinical labs, monofilament, MoCA, and numeric survey scores.

- No participant identifiers, join keys, source filenames, or observation dates are exported.
- Each domain uses a distinct participant example. Clinical rows within one domain remain coherent.
- Signal times are relative to the selected recording window.
- Wearable series are thinned to at most 300 displayed points. ECG retains native sampling for all twelve leads.
- Clinical export is limited to named numeric fields. Free-text responses and diagnostic interpretation text are excluded.
- ECG rate, intervals, and axes come from the selected recording's device header. They are automated, not physician reviewed.
- Source units are preserved. Missing values remain unavailable.

The preview directory is owner-only and its JSON file has mode `0600`. The extractor refuses to write inside the application checkout. These precautions do not change the dataset's access, storage, or sharing terms.

## Serving recordings

The Vite endpoint `/__local_preview` requires both `VITE_AI_READI_LOCAL=1` and an external `AI_READI_PREVIEW_JSON` path. It binds to `127.0.0.1` and returns `Cache-Control: no-store`. Do not expose the development server to an untrusted network.

The endpoint is absent from production builds. Publishing this source repository does not authorize publishing participant records.

## Documentation examples

Environmental files and participant retinal scans are not currently connected by the extractor. The environment card uses five values from the official data dictionary, explicitly identified as documentation examples. Retinal views use attributed crops from published documentation figures. Neither is presented as a matched participant record.

Relevant sources:

- [AI-READI v3 documentation](https://docs.aireadi.org/docs/3/about)
- [Environment data structure](https://docs.aireadi.org/docs/3/dataset/environment/#data-structure)
- [ECG format and device fields](https://docs.aireadi.org/docs/3/dataset/cardiac-ecg/)
- [Monofilament assessment](https://docs.aireadi.org/docs/3/dataset/clinical-data/monofilament-testing)
- [MoCA fields](https://docs.aireadi.org/docs/3/dataset/clinical-data/cognition-MoCA/)
