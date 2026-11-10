"""No participant examples are bundled with these tests."""

import csv
import datetime as dt
import importlib.util
from pathlib import Path
import unittest
import tempfile
from types import SimpleNamespace
from unittest.mock import patch
import sys

MODULE = Path(__file__).resolve().parents[1] / "scripts" / "build_local_preview.py"
spec = importlib.util.spec_from_file_location("build_local_preview", MODULE)
assert spec is not None and spec.loader is not None
preview = importlib.util.module_from_spec(spec)
spec.loader.exec_module(preview)


class LocalPreviewTests(unittest.TestCase):
    def test_relative_time_labels(self):
        self.assertEqual(preview.format_elapsed_time(dt.timedelta(minutes=61)), "+01:01")
        self.assertEqual(preview.format_elapsed_time(dt.timedelta()), "+00:00")

    def test_candidate_selection_never_reuses_participant(self):
        used = {"person-a"}
        candidates = [(12, "person-a", None, []), (8, "person-b", None, [])]
        chosen = preview.select_distinct_candidate(candidates, used)
        self.assertEqual(chosen[1], "person-b")
        self.assertEqual(used, {"person-a", "person-b"})
        with self.assertRaises(RuntimeError):
            preview.select_distinct_candidate(candidates, used)

    def test_ecg_exports_all_leads_at_native_sampling(self):
        names = ["I", "II", "III", "aVR", "aVL", "aVF", "V1", "V2", "V3", "V4", "V5", "V6"]

        class Signal:
            def __len__(self):
                return 600

            def __iter__(self):
                return iter([[0.1] * 12] * 600)

            def __getitem__(self, key):
                return 0.1

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            folder = root / "cardiac_ecg/ecg_12lead/device/person-a"
            folder.mkdir(parents=True)
            (folder / "trace.hea").touch()
            (folder / "trace.dat").touch()
            fake = SimpleNamespace(
                rdheader=lambda _: SimpleNamespace(
                    file_name=["trace.dat"],
                    fs=100,
                    sig_len=600,
                    sig_name=names,
                    units=["mV"] * 12,
                    comments=["Rate: 60", "PR: 150", "participant_id: excluded"],
                ),
                rdrecord=lambda *args, **kwargs: SimpleNamespace(p_signal=Signal()),
            )
            used = set()
            with patch.object(preview, "DATA_ROOT", root), patch.dict(sys.modules, {"wfdb": fake}):
                view = preview.extract_ecg(used)
            self.assertEqual(view["kind"], "ecg")
            self.assertEqual([row["label"] for row in view["measurements"]], ["Rate", "PR"])
            self.assertEqual([lead["name"] for lead in view["leads"]], names)
            self.assertEqual(len(view["leads"][0]["points"]), 600)
            self.assertEqual(view["sampleRate"], 100)
            self.assertEqual(view["durationSeconds"], 6)
            self.assertEqual(used, {"person-a"})
            self.assertNotIn("person-a", str(view))

    def test_clinical_extracts_domains_without_ids_or_invented_values(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "clinical_data").mkdir()
            fields = [
                "person_id",
                "measurement_source_value",
                "value_as_number",
                "unit_source_value",
            ]
            with (root / "clinical_data/measurement.csv").open("w", newline="") as handle:
                writer = csv.writer(handle)
                writer.writerow(fields)
                writer.writerows(
                    [
                        ["lab-person", "import_glucose, Glucose", "98", "mg/dL"],
                        ["nerve-person", "mssrffl, Right Foot - Felt:", "10", ""],
                        ["nerve-person", "msslffl, Left Foot - Felt:", "9", ""],
                        ["brain-person", "moca_total_score", "27", ""],
                        ["bad-person", "moca_total_score", "999", ""],
                    ]
                )
            with patch.object(preview, "DATA_ROOT", root):
                data = preview.clinical(set())
            self.assertEqual(set(data), {"labs", "nervous", "cognitive"})
            self.assertEqual(len(data["nervous"]["rows"]), 2)
            self.assertEqual(data["labs"]["rows"][0]["unit"], "mg/dL")
            self.assertEqual(data["cognitive"]["rows"][0]["value"], "27")
            self.assertNotIn("person", str(data))

    def test_missing_clinical_data_has_no_fabricated_fallback(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(preview, "DATA_ROOT", Path(directory)):
                self.assertEqual(preview.clinical(set()), {})

    def test_absent_time_is_not_fabricated(self):
        self.assertIsNone(preview.parse_timestamp({"effective_time_frame": {}}))


if __name__ == "__main__":
    unittest.main()
