---
description: Intelligent completion workflow with timeline tracking
---
# Workflow: Smart Complete

## Usage
User: "/smart_complete I finished [description]"

## Agent Steps

### 1. Scan
Run the `complete` command via the appropriate script (`.ps1` or `.sh`).

### 2. Match
Identify the issue number that matches the user's description.

### 3. Execution
Run:
`.../smart-ops.[ps1|sh] close [Number] "Completed via Smart Ops"`

### 4. Project Cleanup (If using Projects)
If the user provides a Project Item ID, run:
`.../smart-ops.[ps1|sh] done [ItemID]`

### 5. Report
State that the issue is closed and logged as complete.