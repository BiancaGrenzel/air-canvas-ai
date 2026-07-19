# ADR 0001 — Single Vite app with layered folders

## Status

Accepted

## Context

AirCanvas AI needs a professional, scalable foundation that can later migrate to Tauri without rewriting business rules.

## Decision

Start as a single Vite + React + TypeScript application with Clean Architecture folders (`domain`, `application`, `infrastructure`) and module facades (`vision`, `camera`, `gesture`, `cursor`, `canvas`).

## Consequences

- Faster bootstrap for contributors
- Clear migration path: add `apps/desktop` later and reuse domain/application
- Adapters stay isolated under `infrastructure/*/web` (and future `tauri`)
