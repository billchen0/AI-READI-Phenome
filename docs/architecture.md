# Architecture

## Interface

`App.tsx` owns the selected view and sensor/organ layer. `BodyStage` mounts the canvas and accessible scene controls. `HumanScene` supplies lighting, camera controls, and the mannequin. Wearable models and organ models live in separate scene modules.

`DetailOverlay` owns dialog behavior, keyboard dismissal, and focus. The components in `components/details/` render the index, signals, clinical views, and organ cards. Shared headers, charts, and tables keep the cards consistent.

## Data

`ShowcaseData` loads local recordings once when development access is enabled. Otherwise it supplies documentation mode with no recording payload. Display metadata lives in `data/`; waveform generation is confined to test fixtures.

The Python extractor produces a bounded JSON payload outside the checkout. The development plugin in `vite.config.ts` reads that file. Frontend environment variables never contain the dataset path.

## Geometry

Coordinates are metres: +X is patient left, +Y is superior, and +Z is anterior. `organPlacement.ts` defines fit extents and axis conventions. `fitOrganModel` centers imported geometry and applies a uniform scale. Sensor coordinates are fitted to the mannequin surface.

`npm run test:anatomy` loads geometry without textures, bakes the mannequin's pose, checks organ vertices against the outer skin envelope, and detects intersections between organ surfaces. This is a geometric regression check, not a clinical validation of internal anatomy. The mannequin has no registered internal skeleton or imaging; the peripheral nerve paths remain schematic.

## Verification

TypeScript tests cover electrode and device placements, elapsed-time ticks, organ relationships, and fixture waveforms. Python tests cover relative timestamps, participant separation, twelve-lead extraction, clinical field selection, and missing-data behavior. All checks run without licensed data.
