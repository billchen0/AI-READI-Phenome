#!/usr/bin/env python3
"""Build an owner-only, local-only AI-READI preview. Never publish its output.

Uses independently chosen source files per modality. Participant identifiers, absolute
observation dates, file names, and join keys are never written to the preview.
Requires wfdb for ECG: .venv/bin/python scripts/build_local_preview.py
"""

from __future__ import annotations

import csv
import datetime as dt
import json
import math
import os
from pathlib import Path

DATA_ROOT = Path(os.environ.get("AI_READI_SAMPLE_DIR", "data/ai-readi-y3"))
PREVIEW_PATH = Path(
    os.environ.get(
        "AI_READI_PREVIEW_JSON", str(Path.home() / ".local/share/ai-readi-phenome/preview.json")
    )
)
MEASURES = {
    "continuous_glucose_monitoring": ("CGM", "cgm", "blood_glucose"),
    "heart_rate": ("Heart rate", "heart_rate", "heart_rate"),
    "oxygen_saturation": ("Oxygen saturation", "breathing", "oxygen_saturation"),
    "physical_activity": ("Physical activity", "activity", "base_movement_quantity"),
    "physical_activity_calorie": ("Activity calories", "activity", "calories_value"),
    "respiratory_rate": ("Respiratory rate", "breathing", "respiratory_rate"),
    "stress": ("Stress", "stress", "stress"),
}


def parse_timestamp(item):
    frame = item.get("effective_time_frame") or {}
    text = frame.get("date_time") or (frame.get("time_interval") or {}).get("start_date_time")
    if not text:
        return None
    try:
        return dt.datetime.fromisoformat(str(text).replace("Z", "+00:00"))
    except ValueError:
        return None


def find_candidates(modality):
    parent = (
        DATA_ROOT / "wearable_blood_glucose"
        if modality == "continuous_glucose_monitoring"
        else DATA_ROOT / "wearable_activity_monitor"
    ) / modality
    if not parent.is_dir():
        return []
    found = []
    for path in parent.rglob("*.json"):
        try:
            data = json.loads(path.read_text())
            body = data.get("body") or {}
            key = "sleep" if modality == "sleep" else MEASURES[modality][1]
            rows = body.get(key) or []
            if rows:
                private_id = (
                    (data.get("header") or {}).get("patient_id")
                    or (data.get("header") or {}).get("user_id")
                    or path.parent.name
                )
                found.append((len(rows), str(private_id), path, rows))
                if len(found) >= 12:
                    break
        except (OSError, ValueError, TypeError):
            continue
    return sorted(found, key=lambda row: -row[0])


def select_distinct_candidate(candidates, used):
    for candidate in candidates:
        if candidate[1] not in used:
            used.add(candidate[1])
            return candidate
    if candidates:
        raise RuntimeError(
            "No distinct participant exemplar available for one modality; cannot imply independence"
        )
    return None


def format_elapsed_time(delta):
    minutes = round(delta.total_seconds() / 60)
    return f"+{minutes // 60:02d}:{minutes % 60:02d}"


def extract_series(modality, used):
    selected = select_distinct_candidate(find_candidates(modality), used)
    if not selected:
        return None
    _, _, _, rows = selected
    label, _, key = MEASURES[modality]
    good = []
    unit = None
    for row in rows:
        measurement = row.get(key) or {}
        value = measurement.get("value") if isinstance(measurement, dict) else None
        time = parse_timestamp(row)
        if not isinstance(value, (int, float)) or not math.isfinite(value) or time is None:
            continue
        unit = unit or measurement.get("unit")
        good.append((time, round(float(value), 3)))
    if not good:
        return None
    good.sort(key=lambda v: v[0])
    first = good[0][0]
    # The data window is a visual example, not a daily summary or cohort statistic.
    selected_window = [p for p in good if (p[0] - first).total_seconds() <= 24 * 3600]
    if len(selected_window) < 10:
        selected_window = good[:300]
    stride = max(1, math.ceil(len(selected_window) / 300))
    sampled = selected_window[::stride]
    return {
        "label": label,
        "unit": str(unit or "recorded unit"),
        "kind": "series",
        "points": [[(t - first).total_seconds(), v] for t, v in sampled],
        "note": "One recorded exemplar, independently selected for this modality. Dates and identifiers removed; elapsed time only.",
    }


def extract_sleep(used):
    selected = select_distinct_candidate(find_candidates("sleep"), used)
    if not selected:
        return None
    rows = selected[3]
    intervals = []
    for row in rows:
        frame = (row.get("effective_time_frame") or {}).get("time_interval") or {}
        try:
            start = dt.datetime.fromisoformat(str(frame["start_date_time"]).replace("Z", "+00:00"))
            end = dt.datetime.fromisoformat(str(frame["end_date_time"]).replace("Z", "+00:00"))
        except (KeyError, ValueError):
            continue
        if end > start:
            intervals.append((start, end, str(row.get("sleep_stage_state") or "unknown")))
    if not intervals:
        return None
    intervals.sort(key=lambda x: x[0])
    first = intervals[0][0]
    window = [x for x in intervals if (x[0] - first).total_seconds() < 12 * 3600][:120]
    return {
        "label": "Sleep",
        "unit": "stage",
        "kind": "categories",
        "segments": [
            {
                "start": format_elapsed_time(a - first),
                "end": format_elapsed_time(b - first),
                "label": stage,
            }
            for a, b, stage in window
        ],
        "note": "One recorded sleep-stage example. Dates and identifiers removed; elapsed time only.",
    }


def extract_ecg(used):
    import wfdb

    parent = DATA_ROOT / "cardiac_ecg" / "ecg_12lead"
    if not parent.is_dir():
        return None
    for header in parent.rglob("*.hea"):
        base = header.with_suffix("")
        try:
            meta = wfdb.rdheader(str(base))
            # WFDB headers may point to a data file with a different stem.
            if not meta.file_name or not (header.parent / meta.file_name[0]).exists():
                continue
            private_id = str(header.parent.name)
            if private_id in used:
                continue
            fs = int(meta.fs)
            if fs <= 0 or meta.sig_len < fs * 4:
                continue
            names = ["I", "II", "III", "aVR", "aVL", "aVF", "V1", "V2", "V3", "V4", "V5", "V6"]
            lookup = {name.upper(): i for i, name in enumerate(meta.sig_name)}
            if not all(name.upper() in lookup for name in names):
                continue
            channels = [lookup[name.upper()] for name in names]
            if any(meta.units[i] != "mV" for i in channels):
                continue
            data = wfdb.rdrecord(
                str(base),
                sampfrom=0,
                sampto=min(meta.sig_len, fs * 6),
                channels=channels,
                physical=True,
            ).p_signal
            if not all(math.isfinite(float(v)) for row in data for v in row):
                continue
            # Retain original sampling: thinning ECG can distort QRS morphology.
            used.add(private_id)
            annotations = {}
            for comment in getattr(meta, "comments", []) or []:
                key, separator, value = comment.partition(":")
                if separator:
                    annotations[key.strip()] = value.strip()
            measurements = []
            for key, label, unit in [
                ("Rate", "Rate", "bpm"),
                ("PR", "PR", "ms"),
                ("QRSD", "QRS duration", "ms"),
                ("QT", "QT", "ms"),
                ("QTc", "QTc", "ms"),
                ("P", "P axis", "°"),
                ("QRS", "QRS axis", "°"),
                ("T", "T axis", "°"),
            ]:
                try:
                    value = float(annotations.get(key, ""))
                except ValueError:
                    continue
                if math.isfinite(value):
                    measurements.append({"label": label, "value": f"{value:g}", "unit": unit})
            return {
                "label": "12-lead ECG",
                "unit": "mV",
                "kind": "ecg",
                "measurements": measurements,
                "sampleRate": fs,
                "durationSeconds": len(data) / fs,
                "leads": [
                    {
                        "name": name,
                        "points": [[i / fs, round(float(data[i, j]), 4)] for i in range(len(data))],
                    }
                    for j, name in enumerate(names)
                ],
                "note": "Recorded 12-lead ECG excerpt at native sampling. Dates and identifiers omitted; independent of other modality examples.",
            }

        except (OSError, ValueError, IndexError, TypeError):
            continue
    return None


LAB_FIELDS = {
    "import_hba1c": "HbA1c",
    "import_glucose": "Glucose",
    "import_insulin": "Insulin",
    "import_c_peptide": "C-peptide",
    "import_nt_probnp": "NT-proBNP",
    "import_troponin_t": "Troponin-T",
    "import_creatinine": "Creatinine",
    "import_bun": "BUN",
    "import_urine_albumin": "Urine albumin",
    "import_urine_creatinine": "Urine creatinine",
    "import_alt_got": "ALT",
    "import_ast_got": "AST",
    "import_bilirubin_total": "Total bilirubin",
    "import_total_cholesterol": "Total cholesterol",
    "import_triglycerides": "Triglycerides",
    "import_hdl_cholesterol": "HDL cholesterol",
    "import_ldl_cholesterol": "LDL cholesterol",
}
NERVE_FIELDS = {
    "msslffl": "Left foot · correct responses",
    "mssrffl": "Right foot · correct responses",
}
COGNITIVE_FIELDS = {
    "moca_total_score": "MoCA total score",
    "moca_combined_mis_score": "Memory Index Score",
    "moca_orientation": "Orientation",
    "moca_abstraction": "Abstraction",
    "delayed_recall_with_no_clue": "Delayed recall",
    "digitspan": "Digit span",
    "lettera": "Letter tapping",
    "subtraction": "Serial subtraction",
    "repetition": "Sentence repetition",
    "fluency_language": "Verbal fluency",
    "naming": "Naming",
    "trails_visuospatial_executive": "Trail drawing",
    "cube_visuospatial_executive": "Cube drawing",
    "clock_visuospatial_executive": "Clock drawing",
}
SURVEY_FIELDS = {"dietscore": "Diet score", "cestl": "CES-D-10 score"}


def clinical(used):
    groups = {"labs": {}, "nervous": {}, "cognitive": {}, "surveys": {}}
    for filename, source_column, fields_by_group in [
        (
            "measurement.csv",
            "measurement_source_value",
            {"labs": LAB_FIELDS, "nervous": NERVE_FIELDS, "cognitive": COGNITIVE_FIELDS},
        ),
        (
            "observation.csv",
            "observation_source_value",
            {"surveys": SURVEY_FIELDS, "cognitive": COGNITIVE_FIELDS},
        ),
    ]:
        path = DATA_ROOT / "clinical_data" / filename
        if not path.exists():
            continue
        with path.open(newline="") as handle:
            for row in csv.DictReader(handle):
                code = row.get(source_column, "").split(",", 1)[0].strip()
                for group, fields in fields_by_group.items():
                    if code not in fields:
                        continue
                    try:
                        value = float(row.get("value_as_number", ""))
                    except (ValueError, TypeError):
                        continue
                    if not math.isfinite(value) or value < 0:
                        continue
                    if group == "nervous" and (value > 10 or not value.is_integer()):
                        continue
                    if code == "moca_total_score" and value > 30:
                        continue
                    private_id = row.get("person_id", "")
                    if not private_id:
                        continue
                    unit = str(row.get("unit_source_value") or "").strip()
                    if unit.lower() in ("none", "nan", "null"):
                        unit = ""
                    # Preserve documented comparison operators, never arbitrary free text.
                    raw = str(row.get("value_source_value") or "").strip()
                    display = f"{value:g}"
                    if raw.startswith(("<", ">")):
                        try:
                            float(raw.lstrip("<>= "))
                            display = raw
                        except ValueError:
                            pass
                    if group == "nervous":
                        unit = "of 10"
                    if group == "cognitive":
                        unit = "of 30" if code == "moca_total_score" else "points"
                    if group == "surveys":
                        unit = "score"
                    person = groups[group].setdefault(private_id, {})
                    person.setdefault(code, {"label": fields[code], "value": display, "unit": unit})
    result = {}
    for group, people in groups.items():
        # Choose one coherent panel per domain; never join across domains in the UI.
        eligible = [(key, rows) for key, rows in people.items() if key not in used]
        if group == "nervous":
            eligible = [(key, rows) for key, rows in eligible if len(rows) == 2]
        if group == "cognitive":
            eligible = [(key, rows) for key, rows in eligible if "moca_total_score" in rows]
        if not eligible:
            continue
        key, rows = max(eligible, key=lambda item: len(item[1]))
        used.add(key)
        result[group] = {
            "label": {
                "labs": "Clinical labs",
                "surveys": "Survey scores",
                "nervous": "Monofilament assessment",
                "cognitive": "Cognitive function · MoCA",
            }[group],
            "kind": "labs",
            "rows": list(rows.values()),
            "note": "One recorded example, independently selected for this domain. Identifiers and dates omitted.",
            "caveat": "Not for clinical use.",
        }
    return result


def main():
    if not DATA_ROOT.is_dir():
        raise SystemExit("Set AI_READI_SAMPLE_DIR to an accessible AI-READI dataset directory.")
    used = set()
    modalities = {}
    missing = []
    for name in [
        "continuous_glucose_monitoring",
        "heart_rate",
        "oxygen_saturation",
        "physical_activity",
        "physical_activity_calorie",
        "respiratory_rate",
        "sleep",
        "stress",
        "ecg_12lead",
    ]:
        view = (
            extract_ecg(used)
            if name == "ecg_12lead"
            else extract_sleep(used)
            if name == "sleep"
            else extract_series(name, used)
        )
        if view is None:
            missing.append(name)
            continue
        modalities[name] = view
    payload = {
        "source": "AI-READI dataset v3.0.0 — local restricted preview",
        "modalities": modalities,
        "missing": missing,
        "clinical": clinical(used),
        "environment": None,
    }
    repository = Path(__file__).resolve().parents[1]
    if PREVIEW_PATH.resolve().is_relative_to(repository):
        raise RuntimeError("Preview output must be outside the application repository")
    PREVIEW_PATH.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    os.chmod(PREVIEW_PATH.parent, 0o700)
    temp = PREVIEW_PATH.with_suffix(".partial")
    with temp.open("w") as f:
        json.dump(payload, f, separators=(",", ":"))
    os.chmod(temp, 0o600)
    temp.replace(PREVIEW_PATH)
    print(
        "Local preview generated:",
        len(modalities),
        "modality views;",
        PREVIEW_PATH.stat().st_size,
        "bytes; output restricted to owner.",
    )
    for name, view in modalities.items():
        print(
            name,
            view["kind"],
            len(view.get("points", view.get("segments", view.get("leads", [])))),
            "items",
        )
    if missing:
        print("Missing usable source modalities:", ", ".join(missing))


if __name__ == "__main__":
    main()
