import contextlib
import io
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

import core


@contextlib.contextmanager
def working_directory(path: Path):
    previous = Path.cwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(previous)


class CapabilityTests(unittest.TestCase):
    def test_manifest_requires_command_lists(self):
        payload = {
            "id": "bad",
            "nombre": "Bad",
            "backend_instalacion": "local_command",
            "comandos": {"verify": "echo bad"},
        }
        with self.assertRaises(Exception) as raised:
            core.CapabilityManifest.model_validate(payload)
        self.assertIn("valid list", str(raised.exception))

    def test_install_verify_list_with_local_command(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            with working_directory(Path(temp_dir)):
                manifest = {
                    "id": "echo-capability",
                    "nombre": "Echo Capability",
                    "descripcion": "Test capability",
                    "backend_instalacion": "local_command",
                    "comandos": {
                        "install": [sys.executable, "-c", "print('installed')"],
                        "verify": [sys.executable, "-c", "print('verified')"],
                    },
                    "tags": ["test"],
                    "offline": True,
                    "requires_gpu": False,
                }

                install_result = json.loads(core.instalar_capacidad("echo-capability", json.dumps(manifest)))
                self.assertEqual(install_result["status"], "ok")
                self.assertEqual(install_result["capability_id"], "echo-capability")
                self.assertIn("installed", install_result["data"]["execution"]["stdout"])

                verify_result = json.loads(core.verificar_capacidad("echo-capability"))
                self.assertEqual(verify_result["status"], "ok")
                self.assertIn("verified", verify_result["data"]["execution"]["stdout"])

                list_result = json.loads(core.listar_capacidades_instalables())
                self.assertEqual(list_result["status"], "ok")
                self.assertEqual(list_result["data"]["count"], 1)

                state = json.loads(Path("omni_workflow.json").read_text(encoding="utf-8"))
                self.assertIn("echo-capability", state["metadatos_globales"]["capability_registry"])
                self.assertEqual(len(state["metadatos_globales"]["installation_history"]), 2)

    def test_missing_backend_command_is_structured(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            with working_directory(Path(temp_dir)):
                manifest = {
                    "id": "missing-tool",
                    "nombre": "Missing Tool",
                    "backend_instalacion": "local_command",
                    "comandos": {"install": ["definitely-not-a-real-command-k7"]},
                }
                result = json.loads(core.instalar_capacidad("missing-tool", json.dumps(manifest)))
                self.assertEqual(result["status"], "error")
                self.assertEqual(result["error"]["type"], "COMMAND_NOT_FOUND")
                self.assertIs(result["error"]["recoverable"], True)

    def test_cli_argparse_contract(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            with working_directory(Path(temp_dir)):
                manifest_path = Path(temp_dir) / "manifest.json"
                manifest_path.write_text(
                    json.dumps(
                        {
                            "id": "cli-capability",
                            "nombre": "CLI Capability",
                            "backend_instalacion": "local_command",
                            "comandos": {"install": [sys.executable, "-c", "print('cli installed')"]},
                        }
                    ),
                    encoding="utf-8",
                )

                self.assertEqual(core.run_argparse_cli(["init"]), 0)
                self.assertTrue(os.path.exists("omni_workflow.json"))

                output = io.StringIO()
                with contextlib.redirect_stdout(output):
                    self.assertEqual(core.run_argparse_cli(["capability", "install", str(manifest_path)]), 0)
                self.assertIn("cli-capability", output.getvalue())


if __name__ == "__main__":
    unittest.main()
