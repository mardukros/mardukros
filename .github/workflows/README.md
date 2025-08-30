# Roadmap Issues GitHub Actions

This directory contains GitHub Actions workflows that automatically generate issues from the node-llama-cpp roadmap.

## Workflows

### 1. `roadmap-issues.yml` - Generate Roadmap Issues

Automatically creates GitHub issues for unchecked deliverables in the node-llama-cpp roadmap.

**Triggers:**
- **Schedule**: Every Monday at 9 AM UTC
- **Manual**: Can be triggered manually via GitHub Actions UI

**Features:**
- Parses `wiki/development/node-llama-cpp-roadmap.md`
- Creates issues for unchecked deliverables (`- [ ]` items)
- Organizes issues by phase with appropriate labels
- Avoids creating duplicate issues
- Supports dry-run mode for testing

**Labels Applied:**
- `roadmap` - All roadmap-generated issues
- `node-llama-cpp` - Related to the integration project
- `phase-1`, `phase-2`, `phase-3`, `phase-4` - Phase organization
- `priority-high`, `priority-medium`, `priority-low` - Priority based on phase

**Manual Trigger Options:**
- `dry_run`: Set to `true` to see what issues would be created without actually creating them

### 2. `setup-roadmap-labels.yml` - Setup Roadmap Labels

One-time setup workflow to create the necessary labels for roadmap issues.

**Triggers:**
- **Manual**: Run once to set up labels

**Created Labels:**
- `roadmap` (blue) - Issues generated from project roadmap
- `node-llama-cpp` (purple) - Related to node-llama-cpp integration
- `phase-1` (light purple) - Phase 1: Foundation & Infrastructure
- `phase-2` (light green) - Phase 2: Core Integration
- `phase-3` (light yellow) - Phase 3: Advanced Features
- `phase-4` (light orange) - Phase 4: Production Readiness
- `priority-high` (red) - High priority task
- `priority-medium` (yellow) - Medium priority task
- `priority-low` (green) - Low priority task

## Usage

### Initial Setup

1. Run the label setup workflow once:
   - Go to Actions → "Setup Roadmap Labels" → Run workflow

### Regular Usage

The roadmap issues workflow will run automatically every Monday, or you can:

1. **Manual Run**: Go to Actions → "Generate Roadmap Issues" → Run workflow
2. **Dry Run**: Use the dry run option to preview what issues would be created

### Updating the Roadmap

When deliverables are completed:

1. Update the roadmap file: `wiki/development/node-llama-cpp-roadmap.md`
2. Change `- [ ]` to `- [x]` for completed items
3. The action will automatically skip completed items

## Issue Format

Generated issues follow this format:

```
Title: [Phase X: Name] Deliverable Title

Body:
- Links back to the roadmap
- Includes acceptance criteria
- Phase context
- Implementation guidelines
```

## Troubleshooting

- **Duplicate Issues**: The action checks for existing issues by title
- **Missing Labels**: Run the setup labels workflow
- **Parsing Issues**: Check the roadmap file format matches the expected structure

## Development

To test changes to the parsing logic:

```bash
cd /path/to/repo
node -e "
// Copy the parsing function from roadmap-issues.yml
// Test with the actual roadmap file
"
```