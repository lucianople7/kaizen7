"""OmniAgentEngine local capability layer for KAIZEN7.

This module provides a small, defensive CLI and MCP-ready API for registering,
installing, verifying, starting and stopping local capabilities. Capabilities are
defined by JSON manifests, so the core never needs to know about concrete apps
such as ComfyUI, Ollama, Whisper, Graphify, Memanto or Headroom.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, ValidationError, field_validator, model_validator

try:  # Typer is the preferred CLI surface when available.
    import typer
except ImportError:  # pragma: no cover - exercised in minimal local runtimes.
    typer = None

try:  # FastMCP is optional; the decorators remain import-safe without it.
    from fastmcp import FastMCP
except ImportError:  # pragma: no cover - optional dependency.

    class FastMCP:  # type: ignore[no-redef]
        """Tiny fallback that keeps @mcp.tool() import-safe when FastMCP is absent."""

        def __init__(self, name: str) -> None:
            self.name = name
            self.tools: Dict[str, Any] = {}

        def tool(self):
            def decorator(func):
                self.tools[func.__name__] = func
                return func

            return decorator


STATE_FILE = Path("omni_workflow.json")
mcp = FastMCP("OmniAgentEngine")


class CapabilityCommandError(ValueError):
    """Raised when a manifest command is not a safe argv list."""


class CapabilityManifest(BaseModel):
    """Validated manifest for an installable local capability.

    Agents should provide every executable command as a JSON array, never as a
    shell string. The `backend_instalacion` field selects the adapter while the
    `comandos` object defines the concrete install/start/stop/verify operations.
    """

    id: str = Field(min_length=1)
    nombre: str = Field(min_length=1)
    descripcion: str = ""
    tipo: str = "app_local"
    backend_instalacion: str = "local_command"
    comandos: Dict[str, List[str]] = Field(default_factory=dict)
    puertos: List[int] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    offline: bool = True
    requires_gpu: bool = False

    @field_validator("id")
    @classmethod
    def validate_id(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not normalized:
            raise ValueError("Capability id cannot be empty")
        if any(char.isspace() for char in normalized):
            raise ValueError("Capability id cannot contain spaces")
        return normalized

    @field_validator("backend_instalacion")
    @classmethod
    def validate_backend(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in {"pinokio", "local_command"}:
            raise ValueError("backend_instalacion must be 'pinokio' or 'local_command'")
        return normalized

    @field_validator("comandos")
    @classmethod
    def validate_commands(cls, value: Dict[str, List[str]]) -> Dict[str, List[str]]:
        for action, command in value.items():
            if not isinstance(command, list) or not command:
                raise CapabilityCommandError(f"Command '{action}' must be a non-empty list")
            if not all(isinstance(part, str) and part for part in command):
                raise CapabilityCommandError(f"Command '{action}' must contain only non-empty strings")
        return value

    @model_validator(mode="after")
    def validate_pinokio_shape(self) -> "CapabilityManifest":
        if self.backend_instalacion == "pinokio":
            for action, command in self.comandos.items():
                if action in {"install", "start", "stop"} and command[0].lower() != "pinokio":
                    raise ValueError(f"Pinokio command '{action}' must start with 'pinokio'")
        return self


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def structured_response(
    status: str,
    action: str,
    capability_id: Optional[str] = None,
    data: Optional[Dict[str, Any]] = None,
    error_type: Optional[str] = None,
    message: Optional[str] = None,
    recoverable: bool = True,
) -> Dict[str, Any]:
    """Build a JSON-serializable result for CLI, MCP and agent callers."""

    return {
        "schema": "omni_agent_engine.capability_result.v1",
        "status": status,
        "action": action,
        "capability_id": capability_id,
        "data": data or {},
        "error": None
        if status == "ok"
        else {
            "type": error_type or "CAPABILITY_ERROR",
            "message": message or "Capability action failed",
            "recoverable": recoverable,
        },
        "timestamp": now_iso(),
    }


def to_json(payload: Dict[str, Any]) -> str:
    return json.dumps(payload, ensure_ascii=False, indent=2)


def load_state(path: Path = STATE_FILE) -> Dict[str, Any]:
    if not path.exists():
        return {
            "schema": "omni_agent_engine.workflow_state.v1",
            "created_at": now_iso(),
            "metadatos_globales": {
                "capability_registry": {},
                "installation_history": [],
            },
            "pipeline_steps": [],
        }
    state = json.loads(path.read_text(encoding="utf-8"))
    metadata = state.setdefault("metadatos_globales", {})
    metadata.setdefault("capability_registry", {})
    metadata.setdefault("installation_history", [])
    state.setdefault("pipeline_steps", [])
    return state


def save_state(state: Dict[str, Any], path: Path = STATE_FILE) -> None:
    path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def init_state() -> str:
    """Initialize omni_workflow.json without overwriting registered capabilities."""

    state = load_state()
    save_state(state)
    return to_json(structured_response("ok", "init", data={"state_file": str(STATE_FILE)}))


def classify_subprocess_error(command: List[str], result: subprocess.CompletedProcess[str]) -> str:
    if result.returncode == 0:
        return "none"
    if result.returncode == 127:
        return "COMMAND_NOT_FOUND"
    if result.returncode in {1, 2}:
        return "COMMAND_FAILED"
    return "PROCESS_ERROR"


def execute_subprocess(command: List[str], timeout_seconds: int = 120) -> Dict[str, Any]:
    """Execute a local command defensively with shell=False and captured output."""

    if not isinstance(command, list) or not command:
        return {
            "status": "error",
            "error_type": "INVALID_COMMAND",
            "message": "Command must be a non-empty list",
            "command": command,
            "returncode": None,
            "stdout": "",
            "stderr": "",
        }
    if not all(isinstance(part, str) and part for part in command):
        return {
            "status": "error",
            "error_type": "INVALID_COMMAND",
            "message": "Command list must contain only non-empty strings",
            "command": command,
            "returncode": None,
            "stdout": "",
            "stderr": "",
        }
    if shutil.which(command[0]) is None:
        return {
            "status": "error",
            "error_type": "COMMAND_NOT_FOUND",
            "message": f"Executable not found: {command[0]}",
            "command": command,
            "returncode": None,
            "stdout": "",
            "stderr": "",
        }

    try:
        result = subprocess.run(
            command,
            shell=False,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        return {
            "status": "error",
            "error_type": "TIMEOUT",
            "message": f"Command timed out after {timeout_seconds}s",
            "command": command,
            "returncode": None,
            "stdout": exc.stdout or "",
            "stderr": exc.stderr or "",
        }
    except OSError as exc:
        return {
            "status": "error",
            "error_type": "PROCESS_ERROR",
            "message": str(exc),
            "command": command,
            "returncode": None,
            "stdout": "",
            "stderr": "",
        }

    return {
        "status": "ok" if result.returncode == 0 else "error",
        "error_type": classify_subprocess_error(command, result),
        "message": "Command completed" if result.returncode == 0 else "Command failed",
        "command": command,
        "returncode": result.returncode,
        "stdout": result.stdout,
        "stderr": result.stderr,
    }


class InstallerAdapter(ABC):
    """Base class for capability installation backends."""

    backend_name: str

    @abstractmethod
    def run(self, manifest: CapabilityManifest, action: str) -> Dict[str, Any]:
        """Run an action defined by a capability manifest."""


class PinokioAdapter(InstallerAdapter):
    """Adapter that delegates installation and lifecycle actions to Pinokio CLI."""

    backend_name = "pinokio"

    def run(self, manifest: CapabilityManifest, action: str) -> Dict[str, Any]:
        command = manifest.comandos.get(action)
        if not command:
            return {
                "status": "error",
                "error_type": "COMMAND_NOT_DEFINED",
                "message": f"Manifest '{manifest.id}' has no '{action}' command",
            }
        if action in {"install", "start", "stop"} and command[0].lower() != "pinokio":
            return {
                "status": "error",
                "error_type": "INVALID_PINOKIO_COMMAND",
                "message": f"Pinokio action '{action}' must start with 'pinokio'",
            }
        return execute_subprocess(command)


class LocalCommandAdapter(InstallerAdapter):
    """Adapter for already-installed local commands or lightweight local scripts."""

    backend_name = "local_command"

    def run(self, manifest: CapabilityManifest, action: str) -> Dict[str, Any]:
        command = manifest.comandos.get(action)
        if not command:
            return {
                "status": "error",
                "error_type": "COMMAND_NOT_DEFINED",
                "message": f"Manifest '{manifest.id}' has no '{action}' command",
            }
        return execute_subprocess(command)


ADAPTERS: Dict[str, InstallerAdapter] = {
    "pinokio": PinokioAdapter(),
    "local_command": LocalCommandAdapter(),
}


def parse_manifest_json(manifest_json: str) -> CapabilityManifest:
    payload = json.loads(manifest_json)
    return CapabilityManifest.model_validate(payload)


def get_adapter(manifest: CapabilityManifest) -> InstallerAdapter:
    adapter = ADAPTERS.get(manifest.backend_instalacion)
    if adapter is None:
        raise ValueError(f"Unsupported installation backend: {manifest.backend_instalacion}")
    return adapter


def register_manifest(state: Dict[str, Any], manifest: CapabilityManifest) -> None:
    registry = state["metadatos_globales"]["capability_registry"]
    registry[manifest.id] = manifest.model_dump()


def append_history(
    state: Dict[str, Any],
    manifest: CapabilityManifest,
    action: str,
    execution: Dict[str, Any],
) -> None:
    state["metadatos_globales"]["installation_history"].append(
        {
            "timestamp": now_iso(),
            "capability_id": manifest.id,
            "backend": manifest.backend_instalacion,
            "action": action,
            "status": execution.get("status"),
            "error_type": execution.get("error_type"),
            "command": execution.get("command"),
            "returncode": execution.get("returncode"),
        }
    )


def run_capability_action(capability_id: str, action: str) -> str:
    state = load_state()
    registry = state["metadatos_globales"]["capability_registry"]
    manifest_payload = registry.get(capability_id)
    if not manifest_payload:
        return to_json(
            structured_response(
                "error",
                action,
                capability_id,
                error_type="CAPABILITY_NOT_REGISTERED",
                message=f"Capability '{capability_id}' is not registered",
            )
        )
    manifest = CapabilityManifest.model_validate(manifest_payload)
    execution = get_adapter(manifest).run(manifest, action)
    append_history(state, manifest, action, execution)
    save_state(state)
    status = "ok" if execution.get("status") == "ok" else "error"
    return to_json(
        structured_response(
            status,
            action,
            manifest.id,
            data={"execution": execution},
            error_type=execution.get("error_type"),
            message=execution.get("message"),
        )
    )


@mcp.tool()
def instalar_capacidad(nombre_capacidad: str, manifest_json: str) -> str:
    """Register a capability manifest and run its install command through its backend.

    Use this when an agent wants KAIZEN7 to add a local capability such as a
    Pinokio app, local model runner or command-line tool. The manifest controls
    the backend and commands; the core stays app-agnostic.
    """

    try:
        manifest = parse_manifest_json(manifest_json)
        if nombre_capacidad and manifest.id != nombre_capacidad.strip().lower():
            return to_json(
                structured_response(
                    "error",
                    "install",
                    manifest.id,
                    error_type="CAPABILITY_ID_MISMATCH",
                    message="nombre_capacidad must match manifest.id",
                )
            )
        state = load_state()
        register_manifest(state, manifest)
        execution = get_adapter(manifest).run(manifest, "install")
        append_history(state, manifest, "install", execution)
        save_state(state)
        status = "ok" if execution.get("status") == "ok" else "error"
        return to_json(
            structured_response(
                status,
                "install",
                manifest.id,
                data={"manifest": manifest.model_dump(), "execution": execution},
                error_type=execution.get("error_type"),
                message=execution.get("message"),
            )
        )
    except (json.JSONDecodeError, ValidationError, ValueError) as exc:
        return to_json(
            structured_response(
                "error",
                "install",
                nombre_capacidad,
                error_type="INVALID_MANIFEST",
                message=str(exc),
            )
        )


@mcp.tool()
def verificar_capacidad(nombre_capacidad: str) -> str:
    """Run the manifest-defined verify command for a registered capability."""

    return run_capability_action(nombre_capacidad.strip().lower(), "verify")


@mcp.tool()
def arrancar_capacidad(nombre_capacidad: str) -> str:
    """Run the manifest-defined start command for a registered capability."""

    return run_capability_action(nombre_capacidad.strip().lower(), "start")


@mcp.tool()
def detener_capacidad(nombre_capacidad: str) -> str:
    """Run the manifest-defined stop command for a registered capability."""

    return run_capability_action(nombre_capacidad.strip().lower(), "stop")


@mcp.tool()
def listar_capacidades_instalables() -> str:
    """List registered installable capabilities and their metadata."""

    state = load_state()
    registry = state["metadatos_globales"]["capability_registry"]
    return to_json(
        structured_response(
            "ok",
            "list",
            data={
                "count": len(registry),
                "capabilities": list(registry.values()),
            },
        )
    )


def install_from_file(manifest_file: Path) -> str:
    manifest_json = manifest_file.read_text(encoding="utf-8")
    capability_id = json.loads(manifest_json).get("id", "")
    return instalar_capacidad(capability_id, manifest_json)


def build_typer_app():
    app = typer.Typer(help="OmniAgentEngine local capability CLI")
    capability_app = typer.Typer(help="Install and manage local capabilities")

    @app.command("init")
    def init_command():
        typer.echo(init_state())

    @capability_app.command("install")
    def capability_install(manifest_file: Path):
        typer.echo(install_from_file(manifest_file))

    @capability_app.command("verify")
    def capability_verify(capability_id: str):
        typer.echo(verificar_capacidad(capability_id))

    @capability_app.command("start")
    def capability_start(capability_id: str):
        typer.echo(arrancar_capacidad(capability_id))

    @capability_app.command("stop")
    def capability_stop(capability_id: str):
        typer.echo(detener_capacidad(capability_id))

    @capability_app.command("list")
    def capability_list():
        typer.echo(listar_capacidades_instalables())

    app.add_typer(capability_app, name="capability")
    return app


def run_argparse_cli(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="OmniAgentEngine local capability CLI")
    subparsers = parser.add_subparsers(dest="command")
    subparsers.add_parser("init")

    capability = subparsers.add_parser("capability")
    capability_sub = capability.add_subparsers(dest="capability_command")
    install = capability_sub.add_parser("install")
    install.add_argument("manifest_file")
    for action in ["verify", "start", "stop"]:
        action_parser = capability_sub.add_parser(action)
        action_parser.add_argument("capability_id")
    capability_sub.add_parser("list")

    args = parser.parse_args(argv)
    if args.command == "init":
        print(init_state())
        return 0
    if args.command == "capability":
        if args.capability_command == "install":
            print(install_from_file(Path(args.manifest_file)))
            return 0
        if args.capability_command == "verify":
            print(verificar_capacidad(args.capability_id))
            return 0
        if args.capability_command == "start":
            print(arrancar_capacidad(args.capability_id))
            return 0
        if args.capability_command == "stop":
            print(detener_capacidad(args.capability_id))
            return 0
        if args.capability_command == "list":
            print(listar_capacidades_instalables())
            return 0
    parser.print_help()
    return 2


if __name__ == "__main__":
    if typer is not None:
        build_typer_app()()
    else:
        raise SystemExit(run_argparse_cli())
