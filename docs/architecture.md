# Architecture

`App.tsx` owns the selected view and sensor/organ layer. `BodyStage` mounts the canvas and scene controls. `HumanScene` supplies lighting, camera controls, and the mannequin. Wearable and organ models live in separate scene modules.

`DetailOverlay` handles the dialog, keyboard dismissal, and focus. Components in `components/details/` render the measurement index and detail cards. Shared headers, actions, charts, and tables keep their layouts consistent.

`data/synthetic.ts` supplies complete, deterministic examples for every numerical view. Daily signals use smooth rhythms and event peaks; `syntheticEcg.ts` generates twelve ECG leads. The data is generated independently and does not contain or transform participant recordings. `ShowcaseData` makes this bundled payload available to the cards without a server or dataset connection.

Coordinates are metres: +X is patient left, +Y is superior, and +Z is anterior. `organPlacement.ts` defines model fit extents and axis conventions. `fitOrganModel` centers imported geometry and applies uniform scale. The anatomy is educational and is not registered to participant imaging.
