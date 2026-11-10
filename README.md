# AI-READI Phenome

Explore AI-READI sensors, signals, and clinical assessments through an interactive 3D body. Synthetic signals and values based on the AI-READI format are included, so every view is available immediately.

## Run locally

Install [Node.js](https://nodejs.org/) 22.18 or newer, which includes npm. Then open a terminal and run:

```sh
git clone https://github.com/billchen0/AI-READI-Phenome.git
cd AI-READI-Phenome
npm ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Drag to rotate the body, use the zoom controls, and select a sensor or organ to open its measurements. **All modalities** lists every view. Press `Ctrl+C` in the terminal to stop the app.

## Build and preview

```sh
npm run build
npm run preview
```

Open [http://localhost:4173](http://localhost:4173). The production files are written to `dist/`.

## Sources

Retinal images are attributed examples from the AI-READI documentation. See [asset credits](docs/assets.md) for image and 3D-model sources.
