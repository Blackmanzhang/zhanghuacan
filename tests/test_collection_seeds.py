"""Harbour sample edition, including upgrade and consent regressions."""

import tempfile
import unittest
from contextlib import closing
from pathlib import Path
from unittest.mock import patch

import collection_seeds
import moon_workshop
import server


class CollectionSamplesTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.path = Path(tmp.name) / "sample.sqlite3"

    def test_published_edition_and_credits(self):
        server.setup(self.path)
        with closing(server.connect(self.path)) as db:
            letters = {row["id"]: row for row in db.execute("""SELECT l.*,u.demo
                FROM letters l JOIN users u ON u.id=l.author""")}
            new = [letters["sample_" + seed.key] for seed in collection_seeds.LETTERS]
            self.assertEqual(len(new), 26)
            self.assertEqual(len({l["region"] for l in letters.values()}), 21)
            self.assertEqual(sum(l["parent_id"] is None for l in new), 9)
            quoted = [l for l in new if l["quote_text"]]
            self.assertGreaterEqual(len(quoted), 6)
            for letter in new:
                self.assertTrue(letter["demo"] and letter["exhibit"] and letter["is_open"])
                self.assertEqual(letter["status"], "published")
                self.assertTrue(server.regional(letter["region"])[0])
                if letter["parent_id"]:
                    parent = letters[letter["parent_id"]]
                    self.assertLess(parent["created"], letter["created"])
                    self.assertNotEqual(parent["region"], letter["region"])
                    if letter["quote_text"]:
                        self.assertIn(letter["quote_text"], parent["body"])
            workshop = moon_workshop.view(db, "visitor")
            panels = {p["id"]: p for p in workshop["panels"]}
            self.assertEqual(sum(p["current"] is not None for p in panels.values()), 4)
            for key in ("m3", "m5"):
                versions = panels[key]["versions"]
                self.assertEqual(len(versions), 2)
                self.assertEqual(versions[1]["baseId"], versions[0]["id"])
                self.assertTrue(all(v["allowRemix"] and v["demo"] for v in versions))
                layers = versions[1]["layers"]
                self.assertEqual(len({layer["authorId"] for layer in layers}), 2)
                for layer in layers:
                    self.assertEqual(letters[layer["sourceId"]]["author"], layer["authorId"])
                    self.assertTrue(moon_workshop.drawing(layer["items"]))

    def test_occupied_legacy_slots_and_withdrawal_survive_upgrade(self):
        # Start with an older populated installation, including a real author's
        # occupied pen name and in-progress claim.
        with patch.object(collection_seeds, "install"):
            server.setup(self.path)
        with closing(server.connect(self.path)) as db, db:
            db.execute("INSERT INTO users(id,name,region) VALUES('reader','阿琪','香港')")
            db.execute("UPDATE scroll_panels SET claimed_by='reader' WHERE id='m3'")
            db.execute("""INSERT INTO scroll_versions(
                id,panel_id,version,author,region,title,body,art,status,exhibit,created)
                VALUES('personal','m5',1,'reader','香港','未展出的草稿','个人内容','boat',
                'withdrawn',0,'2025-01-01')""")
        server.setup(self.path)
        with closing(server.connect(self.path)) as db, db:
            alias = db.execute("SELECT id,name,demo FROM users WHERE id='archive_ki'").fetchone()
            self.assertNotEqual(alias["name"], "阿琪")
            self.assertTrue(alias["demo"])
            self.assertEqual(db.execute("SELECT demo FROM users WHERE name='阿琪'").fetchone()[0], 0)
            self.assertFalse(db.execute("SELECT 1 FROM scroll_versions WHERE panel_id='m3'").fetchone())
            self.assertEqual(db.execute("SELECT claimed_by FROM scroll_panels WHERE id='m3'").fetchone()[0], "reader")
            self.assertEqual(db.execute("SELECT COUNT(*) FROM scroll_versions WHERE panel_id='m5'").fetchone()[0], 1)
            db.execute("UPDATE letters SET status='withdrawn',exhibit=0 WHERE id='sample_dragon'")
            db.execute("DELETE FROM letters WHERE id='sample_late_route'")
            size = db.execute("SELECT COUNT(*) FROM letters").fetchone()[0]
        server.setup(self.path)
        with closing(server.connect(self.path)) as db:
            self.assertEqual(db.execute("SELECT COUNT(*) FROM letters").fetchone()[0], size)
            self.assertIsNone(db.execute("SELECT 1 FROM letters WHERE id='sample_late_route'").fetchone())
            self.assertEqual(tuple(db.execute(
                "SELECT status,exhibit FROM letters WHERE id='sample_dragon'").fetchone()), ("withdrawn", 0))

    def test_new_sample_versions_obey_live_source_grants(self):
        server.setup(self.path)
        with closing(server.connect(self.path)) as db, db:
            db.execute("UPDATE letters SET exhibit=0 WHERE id='sample_dragon'")
            panel = next(p for p in moon_workshop.view(db, "visitor")["panels"] if p["id"] == "m3")
            self.assertIsNone(panel["current"])
            self.assertEqual(panel["versions"], [])
        server.setup(self.path)
        with closing(server.connect(self.path)) as db:
            self.assertEqual(db.execute("SELECT exhibit FROM letters WHERE id='sample_dragon'").fetchone()[0], 0)
            self.assertFalse(db.execute("PRAGMA foreign_key_check").fetchall())
