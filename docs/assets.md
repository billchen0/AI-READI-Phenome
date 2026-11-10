# Asset attribution

## 3D models

The following models were obtained from the Innerscene 3D Parts Library under its CC0 public-domain dedication. They are centered or scaled for this application. Original source credits and license notices are retained.

| File                    | Source                                                                                                                                                                            | License |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `human-base-rigged.glb` | [Human base mesh with editable 53-bone rig](https://www.innerscene.com/tools/library/3d-parts/human-base-mesh-with-editable-53-bone-rig-8e7c8ab1), based on MakeHuman/MPFB assets | CC0     |
| `organ-brain.glb`       | [Brain](https://www.innerscene.com/tools/library/3d-parts/brain-10d8f88f), adapted from MakeHuman assets                                                                          | CC0     |
| `organ-heart.glb`       | [Heart with major blood vessels](https://www.innerscene.com/tools/library/3d-parts/heart-with-major-blood-vessels-2b67da90), original Innerscene model                            | CC0     |
| `organ-liver.glb`       | [Liver](https://www.innerscene.com/tools/library/3d-parts/liver-ae1a8cc0)                                                                                                         | CC0     |
| `organ-kidneys.glb`     | Kidneys with ureters, [Innerscene 3D Parts Library](https://www.innerscene.com/tools/library/3d-parts), original Innerscene model                                                 | CC0     |

See `public/assets/HUMAN_BASE_RIGGED_LICENSE.txt` and `public/assets/BRAIN_LICENSE.txt` for retained notices. The pancreas, nerve paths, sensor housings, electrode pads, and wires are procedural geometry. Device models are approximate, unbranded representations.

## Retinal images

- `retinal-fundus-doc.webp`: cropped from figure 1, panel B of the [AI-READI retinal photography documentation](https://docs.aireadi.org/docs/3/dataset/retinal-photography).
- `retinal-oct-doc.webp`: cropped from figure 3 of the [AI-READI retinal OCT documentation](https://docs.aireadi.org/docs/3/dataset/retinal-oct); the figure credits UCSD. Original segmentation overlays are retained.

The [documentation repository license](https://github.com/AI-READI/ai-readi-docs/blob/main/LICENSE) is CC BY 4.0. Crops remove surrounding interface content; image pixels and original annotations are otherwise preserved. These are documentation examples, not scans associated with the mannequin or any displayed numerical record.

## Device and assessment references

- [Philips PageWriter TC30 in AI-READI](https://docs.aireadi.org/docs/3/dataset/cardiac-ecg/)
- [Garmin vívosmart 5 in AI-READI](https://docs.aireadi.org/docs/3/dataset/wearable-activity-monitor/)
- [Dexcom G6 in AI-READI](https://docs.aireadi.org/docs/3/dataset/wearable-glucose-monitor/)
- [LeeLab Anura and environmental example values](https://docs.aireadi.org/docs/3/dataset/environment/)
- [Official MoCA reference](https://mocacognition.com/faq)

The AI-READI dataset has separate access and redistribution terms. No participant records are licensed or distributed by this repository.
