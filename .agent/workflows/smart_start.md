---
description: Intelligent start-of-work workflow (Auto-detects OS & Context)
---
# Workflow: Smart Start

## Usage
User: "/smart_start I want to work on [description]"

## Agent Steps

### 1. Script Selection
- **Windows (PowerShell):** Use `.\scripts\smart-ops.ps1`
- **Linux/Mac/Git Bash:** Use `./scripts/smart-ops.sh`

### 2. Scan Work
Run the `start` command to see what is currently on the table.

### 3. Analyze & Template
If creating a **NEW** issue, strictly follow this template for the Body:

#### Title
[Feature/Bug] Clear summary

#### User Story
As a [user], I want [action], so that [benefit].

#### Technical Plan (Root Cause/Solution)
- **Files:** List files to be modified.
- **Logic:** Briefly explain the implementation path.

#### Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

### 4. Execution
Ask the user for a time estimate (e.g., "3 days").
Run:
`.../smart-ops.[ps1|sh] create "Title" "Body" "Label" [Days]`

### 5. Report
Confirm issue creation, start date, and target deadline.