#!/usr/bin/env python3
"""Lightweight repository checks; not a runtime OCR or DB integration test."""
from __future__ import annotations
from pathlib import Path
import ast
import json
import re

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_ROOT = ["README.md", "LICENSE", "SECURITY.md", ".gitignore"]
FORBIDDEN_PARTS = {"node_modules", "__pycache__", ".venv", "build", "build-verify", ".git"}


def main():
    for name in REQUIRED_ROOT:
        assert (ROOT / name).is_file(), f"Missing mandatory file: {name}"
    count = 0
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(ROOT)
        assert not (set(relative.parts) & FORBIDDEN_PARTS), f"Generated artifact committed: {relative}"
        assert path.name not in {".env", ".env.local"}, f"Secret environment file: {relative}"
        assert path.suffix.lower() not in {".backup", ".dump"}, f"Private database dump: {relative}"
        if path.suffix == ".py":
            source = path.read_text(encoding="utf-8")
            ast.parse(source, filename=str(relative))
            assert "postgresql://postgres:2126@" not in source, f"Hardcoded credential: {relative}"
            count += 1
        if path.suffix == ".json":
            with path.open(encoding="utf-8") as stream:
                json.load(stream)
    if (ROOT / "backend/app").is_dir():
        assert (ROOT / "backend/app/main.py").is_file()
        assert (ROOT / "backend/app/routers/receipt_routes.py").is_file()
    if (ROOT / "frontend/src").is_dir():
        assert (ROOT / "frontend/package.json").is_file()
        assert (ROOT / "frontend/src/App.js").is_file()
    print(f"PASS: repository static validation ({count} Python files checked)")


if __name__ == "__main__":
    main()
